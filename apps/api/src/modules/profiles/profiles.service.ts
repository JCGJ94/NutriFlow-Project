import { Injectable } from '@nestjs/common';
import { ProfilesRepository } from './profiles.repository';
import { UpsertProfileDto, ProfileResponseDto, AllergenDto } from './dto';

@Injectable()
export class ProfilesService {
    constructor(private readonly repository: ProfilesRepository) { }

    async getProfile(userId: string): Promise<ProfileResponseDto | null> {
        return this.repository.findByUserId(userId);
    }

    async isUsernameAvailable(username: string): Promise<boolean> {
        return this.repository.isUsernameAvailable(username);
    }

    async upsertProfile(userId: string, dto: UpsertProfileDto): Promise<ProfileResponseDto> {
        const existing = await this.repository.findByUserId(userId);

        if (existing) {
            return this.repository.update(userId, dto);
        }

        return this.repository.create(userId, dto);
    }

    async getAllergens(userId: string): Promise<AllergenDto[]> {
        return this.repository.findUserAllergens(userId);
    }

    async setAllergens(userId: string, allergenIds: string[]): Promise<AllergenDto[]> {
        await this.repository.setUserAllergens(userId, allergenIds);
        return this.repository.findUserAllergens(userId);
    }

    async findAllAllergens(): Promise<AllergenDto[]> {
        return this.repository.findAllAllergens();
    }
}
