import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './modules/users/entities/user.entity';
import { Comment } from './modules/comments/entities/comment.entity';
import { RefreshToken } from './modules/auth/entities/refresh-token.entity';

dotenv.config();

const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Comment, RefreshToken],
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'comments_db',
        entities: [User, Comment, RefreshToken],
        synchronize: true,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
);

async function seed() {
  console.log('🌱 Starting database seed...');
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const commentRepo = AppDataSource.getRepository(Comment);

  // 1. Create Demo Users
  const usersData = [
    { name: 'Anonym', email: 'anonym@example.com', is_guest: true },
    { name: 'Rum_8', email: 'rum8@example.com', is_guest: true },
    { name: 'Alice_W', email: 'alice@example.com', is_guest: false },
    { name: 'Bob_Dev', email: 'bob@example.com', is_guest: false },
    { name: 'Charlie', email: 'charlie@example.com', home_page: 'https://charlie.dev', is_guest: true },
  ];

  const savedUsers: User[] = [];
  for (const u of usersData) {
    let existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      existing = await userRepo.save(userRepo.create(u));
    }
    savedUsers.push(existing);
  }

  // 2. Seed Sample Comments Tree (30+ Root Comments to test 25 items pagination)
  const count = await commentRepo.count();
  if (count > 0) {
    console.log(`ℹ️ Database already contains ${count} comments. Seeding skipped.`);
    await AppDataSource.destroy();
    return;
  }

  console.log('💬 Seeding sample nested comments...');

  for (let i = 1; i <= 30; i++) {
    const author = savedUsers[i % savedUsers.length];
    const rootComment = await commentRepo.save(
      commentRepo.create({
        text: `Заглавное сообщение #${i}. Каждая из нас понимает очевидную вещь: <strong>семантический разбор</strong> внешних противодействий предоставляет широкие возможности. Ссылка: <a href="https://example.com" title="Example">Пример</a>`,
        user: author,
        user_id: author.id,
      })
    );

    // Add nested replies for every 3rd comment
    if (i % 3 === 0) {
      const replyUser1 = savedUsers[(i + 1) % savedUsers.length];
      const child1 = await commentRepo.save(
        commentRepo.create({
          text: `Внезапно, тщательные исследования конкурентов представляют собой <i>яркий пример</i> политической культуры! <code>console.log("Nested reply #${i}.1")</code>`,
          user: replyUser1,
          user_id: replyUser1.id,
          parent_comment_id: rootComment.id,
          root_comment_id: rootComment.id,
        })
      );

      // Deep 2nd level reply
      const replyUser2 = savedUsers[(i + 2) % savedUsers.length];
      await commentRepo.save(
        commentRepo.create({
          text: `Предварительные выводы неутешительны: убеждённость некоторых оппонентов является лишь методом политического взаимодействия.`,
          user: replyUser2,
          user_id: replyUser2.id,
          parent_comment_id: child1.id,
          root_comment_id: rootComment.id,
        })
      );
    }
  }

  console.log('✅ Database successfully seeded with demo users and 30+ nested comments!');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
