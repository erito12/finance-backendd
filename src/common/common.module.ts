// src/common/common.module.ts
import { Global, Module } from "@nestjs/common";
import { ConversionService } from "./service/conversion/conversion.service";

@Global() // Esto hace que no tengas que importar el CommonModule en cada módulo
@Module({
  providers: [ConversionService],
  exports: [ConversionService], // ¡Importante para que otros puedan usarlo!
})
export class CommonModule {}
