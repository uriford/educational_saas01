import { AnnouncementRepository } from "../repository/announcement.repository";

import type {
  CreateAnnouncementRepositoryData,
  UpdateAnnouncementData,
} from "../types";

export class AnnouncementService {
  static async create(
    data: CreateAnnouncementRepositoryData,
  ) {
    try {
      await AnnouncementRepository.create(data);

      return {
        success: true,
        message: "Announcement created successfully.",
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: "Failed to create announcement.",
      };
    }
  }

  static async getAll(
    organizationId: string,
    branchId?: string,
    search?: string,
    page = 1,
    limit = 10,
  ) {
    return AnnouncementRepository.findAll(
      organizationId,
      branchId,
      search,
      page,
      limit,
    );
  }

  static async getById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return AnnouncementRepository.findById(
      id,
      organizationId,
      branchId,
    );
  }

  static async update(
    id: string,
    organizationId: string,
    branchId: string,
    data: UpdateAnnouncementData,
  ) {
    try {
      const result = await AnnouncementRepository.update(
        id,
        organizationId,
        branchId,
        data,
      );

      if (result.count === 0) {
        return {
          success: false,
          message: "Announcement not found.",
        };
      }

      return {
        success: true,
        message: "Announcement updated successfully.",
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: "Failed to update announcement.",
      };
    }
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      const result =
        await AnnouncementRepository.softDelete(
          id,
          organizationId,
          branchId,
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Announcement not found.",
        };
      }

      return {
        success: true,
        message: "Announcement deleted successfully.",
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: "Failed to delete announcement.",
      };
    }
  }
}