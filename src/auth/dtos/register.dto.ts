import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: "L'email n'est pas valide" })
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email: string;

  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  name: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl({}, { message: "L'url de la photo de profil n'est pas valide" })
  @IsOptional()
  imageUrl?: string;
}
