import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FipeService {
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private TTL = 24 * 60 * 60 * 1000; // 24h

  constructor(private http: HttpService) {}

  private async get<T>(path: string): Promise<T> {
    const cached = this.cache.get(path);
    if (cached && Date.now() < cached.expiresAt) return cached.data;

    try {
      const { data } = await firstValueFrom(this.http.get<T>(path));
      this.cache.set(path, { data, expiresAt: Date.now() + this.TTL });
      return data;
    } catch {
      throw new InternalServerErrorException('Falha ao consultar API FIPE');
    }
  }

  getBrands(type: string = 'carros') {
    return this.get(`/${type}/marcas`);
  }

  getModels(type: string, brandCode: string) {
    return this.get(`/${type}/marcas/${brandCode}/modelos`);
  }

  getYears(type: string, brandCode: string, modelCode: string) {
    return this.get(`/${type}/marcas/${brandCode}/modelos/${modelCode}/anos`);
  }

  getPrice(type: string, brandCode: string, modelCode: string, yearCode: string) {
    return this.get(`/${type}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`);
  }
}
