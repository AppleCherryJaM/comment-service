import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FileType {
  IMAGE = 'IMAGE',
  TXT = 'TXT',
}

@Entity('comments')
@Index('idx_comments_parent_created', ['parent_comment_id', 'created_at'])
@Index('idx_comments_root', ['root_comment_id'])
@Index('idx_comments_user', ['user_id'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  parent_comment_id?: string;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_comment_id' })
  parent_comment?: Comment;

  @Column({ type: 'uuid', nullable: true })
  root_comment_id?: string;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'root_comment_id' })
  root_comment?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent_comment)
  replies: Comment[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  file_url?: string;

  @Column({ type: 'enum', enum: FileType, nullable: true })
  file_type?: FileType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
