import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { RegisterUserDto } from '../../auth/dtos/register.dto';

@Injectable()
export class RegisterUserValidationPipe implements PipeTransform {
  transform(value: RegisterUserDto, metadata: ArgumentMetadata) {
    const errors: string[] = [];

    // Validation de l'email
    if (!value.email) {
      errors.push("L'email est obligatoire");
    } else if (!this.isValidEmail(value.email)) {
      errors.push("L'email n'est pas valide");
    }

    // Validation du password
    if (!value.password) {
      errors.push('Le mot de passe est obligatoire');
    } else if (value.password.length < 8) {
      errors.push('Le mot de passe doit faire au moins 8 caractères');
    }

    // Validation du name
    if (!value.name) {
      errors.push('Le nom est obligatoire');
    } else if (typeof value.name !== 'string') {
      errors.push('Le nom doit être une chaîne de caractères');
    }

    // validation de la bio

    // Validation de la bio (optionnelle)
    if (value.bio !== undefined && value.bio !== null) {
      if (typeof value.bio !== 'string') {
        errors.push('La bio doit être une chaîne de caractères');
      } else if (value.bio.length > 160) {
        errors.push('La bio ne doit pas dépasser 160 caractères');
      }
    }

    // Validation de l'url de l'image de profil (optionnelle)
    if (value.imageUrl !== undefined && value.imageUrl !== null) {
      if (typeof value.imageUrl !== 'string') {
        errors.push("L'URL de l'image doit être une chaîne de caractères");
      } else if (!this.isValidUrl(value.imageUrl)) {
        errors.push("L'URL de l'image n'est pas valide");
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return value;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
