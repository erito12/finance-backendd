import { BadRequestException } from "@nestjs/common";
import { PurposeService } from "./purpose.service";

describe("PurposeService", () => {
  it("should reject a default percentage above 100", async () => {
    const repository = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((value) => value),
      save: jest.fn().mockResolvedValue({}),
    };

    const service = new PurposeService(repository as any, {} as any);

    await expect(
      service.create({
        purposeName: "Vacaciones",
        purposePercentage: 25,
        purposeBalance: 0,
        defaultAllocationType: "percentage",
        defaultAllocationValue: 150,
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it("should allow creating a new purpose when existing percentage is stored as a string", async () => {
    const repository = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest
        .fn()
        .mockResolvedValue([{ purposeId: 2, purposePercentage: "20" }]),
      create: jest.fn().mockImplementation((value) => value),
      save: jest.fn().mockResolvedValue({}),
    };

    const service = new PurposeService(repository as any, {} as any);

    await expect(
      service.create({
        purposeName: "Educación",
        purposePercentage: 20,
        purposeBalance: 0,
      } as any),
    ).resolves.toBeDefined();
  });
});
