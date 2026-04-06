import { Module } from "@nestjs/common";
import { PurposeController } from "./purpose.controller";
import { PurposeService } from "./purpose.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PurposeEntity } from "../entities/purpose.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PurposeEntity])],
  providers: [PurposeService],
  controllers: [PurposeController],
  exports: [PurposeService],
})
export class PurposeModule {}
