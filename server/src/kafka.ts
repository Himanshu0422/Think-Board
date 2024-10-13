import fs from "fs";
import { Kafka, Producer } from "kafkajs";
import path from "path";
import prismaClient from "./prisma";

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER!],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASS!,
    mechanism: "plain",
  },
});

let producer: Producer | null = null;

export async function createProducer() {
  if (producer) return producer;
  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(
  message: string,
  boardId: string,
  username: string
) {
  const producer = await createProducer();
  const key = `${boardId}-${username}`;
  const messagePayload = {
    username,
    message,
    boardId,
    timestamp: new Date().toISOString(),
  };

  await producer.send({
    topic: "MESSAGES",
    messages: [{ key, value: JSON.stringify(messagePayload) }],
  });

  return true;
}

export async function startMessageConsumer() {
  console.log("Consumer is running...");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  const messageQueue: Array<{ username: string; message: string; boardId: string; timestamp: Date }> = [];

  consumer.run({
    autoCommit: true,
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      console.log("New Message Received...");
      try {
        const { username, message: text, boardId, timestamp } = JSON.parse(
          message.value.toString()
        );

        // Push the message to the queue
        messageQueue.push({
          username,
          message: text,
          boardId,
          timestamp: new Date(timestamp),
        });
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    },
  });

  // Function to process messages from the queue
  const processMessages = async () => {
    if (messageQueue.length === 0) {
      console.log("No messages to process.");
      return;
    }

    // Process all messages in the queue
    for (const msg of messageQueue) {
      try {
        await prismaClient.message.create({
          data: {
            username: msg.username,
            message: msg.message,
            boardId: msg.boardId,
            timestamp: msg.timestamp,
          },
        });
        console.log(`Processed message from ${msg.username}`);
      } catch (err) {
        console.error("Failed to store message:", err);
        // Optionally, you can add retry logic here if needed
      }
    }

    // Clear the queue after processing
    messageQueue.length = 0;
  };

  // Set an interval to process messages every 10 seconds
  setInterval(processMessages, 10 * 1000);
}
