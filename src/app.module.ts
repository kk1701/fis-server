import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FacultyProfileModule } from './faculty-profile/faculty-profile.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, FacultyProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
