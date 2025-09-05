import 'dotenv/config';
import { PrismaClient, VoteType, NotificationType, NotificationPriority, MediaType, TransactionType, GamificationActionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Users
  const [user1, user2] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'joao@example.com' },
      update: {},
      create: {
        email: 'joao@example.com',
        password: 'password123',
        name: 'João Silva',
        avatarUrl: null,
        bio: 'Desenvolvedor full-stack apaixonado por Node.js',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria@example.com' },
      update: {},
      create: {
        email: 'maria@example.com',
        password: 'password123',
        name: 'Maria Santos',
        avatarUrl: null,
        bio: 'Frontend engineer focada em React e UX',
      },
    }),
  ]);

  // Tags
  const [tagNode, tagJwt, tagReact] = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'node-js' }, update: {}, create: { slug: 'node-js', name: 'node.js' } }),
    prisma.tag.upsert({ where: { slug: 'jwt' }, update: {}, create: { slug: 'jwt', name: 'jwt' } }),
    prisma.tag.upsert({ where: { slug: 'react' }, update: {}, create: { slug: 'react', name: 'react' } }),
  ]);

  // Question
  const question = await prisma.question.create({
    data: {
      title: 'Como implementar autenticação JWT em Node.js?',
      content: 'Preciso de um exemplo de autenticação com refresh tokens usando Express.',
      authorId: user1.id,
      views: 10,
      questionTags: {
        create: [
          { tagId: tagNode.id },
          { tagId: tagJwt.id },
        ],
      },
      media: {
        create: [{ type: MediaType.IMAGE, url: 'https://picsum.photos/800/600', name: 'screenshot.png', size: 1024 * 1024 }],
      },
    },
    include: { questionTags: true },
  });

  // Answer
  const answer = await prisma.answer.create({
    data: {
      questionId: question.id,
      authorId: user2.id,
      content: 'Use jsonwebtoken para gerar tokens e configure refresh tokens com rota dedicada.',
    },
  });

  // Votes
  await Promise.all([
    prisma.questionVote.create({ data: { questionId: question.id, userId: user2.id, type: VoteType.UP } }),
    prisma.answerVote.create({ data: { answerId: answer.id, userId: user1.id, type: VoteType.UP } }),
  ]);

  // Comments
  await prisma.comment.create({
    data: { authorId: user1.id, answerId: answer.id, content: 'Pode incluir exemplo com refresh token?' },
  });

  // Accept as solution
  await prisma.question.update({ where: { id: question.id }, data: { acceptedAnswerId: answer.id } });

  // Chat conversation and messages
  const conversationUsersOrdered = [user1.id, user2.id].sort();
  const conversation = await prisma.conversation.upsert({
    where: { userAId_userBId: { userAId: conversationUsersOrdered[0], userBId: conversationUsersOrdered[1] } },
    update: {},
    create: { userAId: conversationUsersOrdered[0], userBId: conversationUsersOrdered[1] },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conversation.id, senderId: user1.id, receiverId: user2.id, content: 'Oi! Pode revisar minha pergunta?' },
      { conversationId: conversation.id, senderId: user2.id, receiverId: user1.id, content: 'Claro! Já respondi lá.' },
    ],
  });
  await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: user1.id, type: NotificationType.ANSWER, priority: NotificationPriority.NORMAL, title: 'Nova resposta', message: 'Maria respondeu sua pergunta', link: `/questions/${question.id}` },
      { userId: user2.id, type: NotificationType.VOTE, priority: NotificationPriority.NORMAL, title: 'Seu post recebeu um voto', message: 'João deu upvote na sua resposta' },
    ],
  });

  // Currency transactions examples
  await prisma.currencyTransaction.createMany({
    data: [
      { userId: user1.id, type: TransactionType.REWARD, amount: 10, sourceAction: GamificationActionType.DAILY_LOGIN },
      { userId: user2.id, type: TransactionType.REWARD, amount: 50, sourceAction: GamificationActionType.SOLUTION_MARKED, relatedEntityId: answer.id },
    ],
  });

  console.log('Seed concluído com sucesso');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


