import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import {
  IsEmail,
  IsNotEmpty,
  IsDateString,
  Matches,
  Length,
  IsOptional,
} from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @Length(2, 255)
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_user_email')
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Column({ type: 'varchar', length: 15 })
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/)
  primaryMobile!: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/)
  secondaryMobile?: string;

  @Column({ type: 'varchar', length: 12, unique: true })
  @Index('idx_user_aadhaar')
  @IsNotEmpty()
  @Matches(/^\d{12}$/)
  aadhaar!: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  @Index('idx_user_pan')
  @IsNotEmpty()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
  pan!: string;

  @Column({ type: 'date' })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth!: Date;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @Length(2, 255)
  placeOfBirth!: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  currentAddress!: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  permanentAddress!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedBy?: string;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status!: 'active' | 'inactive' | 'suspended';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
