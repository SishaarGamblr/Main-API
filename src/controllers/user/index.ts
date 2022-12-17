import { User } from "@prisma/client";
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../lib/prisma";

export default async (fastify: FastifyInstance) => {

  fastify.addSchema({
    $id: 'user',
    type: 'object',
    properties: {
      id: { type: 'number' }
    }
  });

  fastify.get('/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: { 
            id: { type: 'number' }
          },
          // items: { $ref: 'user#/properties/id'}
        },
      },
    },
    async function findById (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: request.params.id
        }
      });

      reply.send(user);
    }
  );

  fastify.post('/',
    async function create (request: FastifyRequest<{ Body: IUserCreate }>, reply: FastifyReply) {
      const user = await prisma.user.create({
        data: {
          email: request.body.email,
          phone: request.body.phone,
          name: request.body.name,
          profile: {
            create: {}
          },
          wallet: {
            create: { balance: 0 }
          }
        }
      });

      reply.send(user);
    }
  );

  fastify.patch('/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' }
          }
        }
      },
    },
    async function findById (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: request.params.id
        }
      });

      reply.send(user);
    }
  )

}

interface IUserCreate {
  email: string,
  phone: string,
  name: string,
}