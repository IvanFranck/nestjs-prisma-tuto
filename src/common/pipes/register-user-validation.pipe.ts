import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { RegisterDto } from '../../auth/dtos/register.dto';

@Injectable()
export class RegisterUserValidationPipe implements PipeTransform {
  transform(value: RegisterDto, metadata: ArgumentMetadata) {
    if (value.email && typeof value.email === 'string') {
      value.email = value.email.trim().toLowerCase();
    }

    if (value.password && typeof value.password === 'string') {
      value.password = value.password.trim();
    }

    const errors: string[] = [];

    // validations ...
    if (!value.email) {
      errors.push("l'email est obligatoire");
    } else if (typeof value.email !== 'string') {
      errors.push("L'email doit être une chaîne de caractères");
    } else if (!this.isValidEmail(value.email)) {
      errors.push("L'email est invalide");
    }

    // name
    if (!value.name) {
      errors.push('le nom est obligatoire');
    } else if (typeof value.name !== 'string') {
      errors.push('Le nom doit être une chaîne de caractères');
    } else if (value.name.length < 2) {
      errors.push('Le nom doit faire au moins 2 caractères');
    }

    // password
    if (!value.password) {
      errors.push('le mot de passe est obligatoire');
    } else if (typeof value.password !== 'string') {
      errors.push('Le mot de passe doit être une chaîne de caractères');
    } else if (value.password.length < 8) {
      errors.push('Le mot de passe doit faire au moins 8 caractères');
    }

    // bio
    if (value.bio !== undefined && value.bio !== null) {
      if (typeof value.bio !== 'string') {
        errors.push('La bio doit être une chaîne de caractères');
      } else if (value.bio.length > 160) {
        errors.push('La bio ne doit pas dépasser 160 caractères');
      }
    }

    // image url
    if (value.imageUrl !== undefined && value.imageUrl !== null) {
      if (typeof value.imageUrl !== 'string') {
        errors.push(
          "l'url de la photo de profile doit être une chaîne de caractères",
        );
      } else if (!this.isValidUrl(value.imageUrl)) {
        errors.push("l'url de la photo de profile est invalide");
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return value;
  }

  private isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string) {
    try {
      const parseUrl = new URL(url);
      return parseUrl.protocol === 'http:' || parseUrl.protocol === 'https:';
    } catch (error) {
      console.log(
        '🚀 ~ RegisterUserValidationPipe ~ isValidUrl ~ error:',
        error,
      );
      return false;
    }
  }
}
