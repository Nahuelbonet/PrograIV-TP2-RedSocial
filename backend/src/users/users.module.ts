import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { AdminGuard } from '../auth/guards/admin.guard';

@Module({
  imports: [
    // Registra el modelo User con su schema para que Mongoose lo conozca.
    // JwtService llega del JwtModule global (definido en AuthModule).
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, AdminGuard],
  // Exportamos UsersService (lo usa AuthModule) y AdminGuard (lo usan Estadísticas)
  exports: [UsersService, AdminGuard],
})
export class UsersModule {}
