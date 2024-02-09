import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FileSchema, IFilePartSchema, IFileSchema } from "../model";

@Injectable()
export class FileRepository {
  @InjectModel(FileSchema.name) private readonly model: Model<FileSchema>

  async get_by_id(_id: string) {
    return this.model.findOne({ _id })
  }

  async get_by_slug(slug: string) {
    return this.model.findOne({ slug })
  }

  async is_slug_exists(slug: string) {
    return this.model.exists({ slug })
  }

  async new_file(file: IFileSchema) {
    return this.model.create(file)
  }

  async create_file_part(_id: string, file_part: IFilePartSchema) {
    return this.model.updateOne({ _id }, { $push: { parts: { ...file_part, uploaded_size: 0 } } })
  }

  async get_unsynced_files() {
    return this.model.find({ 'parts.0': { $exists: false } }).select('name').lean()
  }

  async delete_file_by_id(_id: string) {
    return this.model.deleteOne({ _id })
  }

  async set_loading_from_cloud_now(_id: string, loading_from_cloud_now: boolean) {
    return this.model.updateOne({ _id }, { loading_from_cloud_now })
  }
}