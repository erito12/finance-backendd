import { Module } from "@nestjs/common";
import { DistributionService } from "./distribution.service";
import { DistributionController } from "./distribution.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Distribution } from "../entities/distribution.entity";
import { AccountModule } from "../account/account.module";

@Module({
  imports: [TypeOrmModule.forFeature([Distribution]), AccountModule],
  providers: [DistributionService],
  controllers: [DistributionController],
})
export class DistributionModule {}
