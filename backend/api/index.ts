import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import type { Request, Response } from 'express';

const server = express();
let ready = false;

async function bootstrap() {
  if (ready) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: false,
  });
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  ready = true;
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  server(req, res);
}
