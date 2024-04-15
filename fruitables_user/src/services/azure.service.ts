import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';

@Injectable()
export class AzureService {
  constructor(private cacheService: CacheService) {}

  async getBlobServiceInstance() {
    try {
      const blobClientService = await BlobServiceClient.fromConnectionString(
        await this.cacheService.get('AZURE_CONNECTION_STRING'),
      );
      return blobClientService;
    } catch (error) {
      console.log(error);
    }
  }

  async getBlobClient(
    containerName: any,
    folderName: string,
    filename: string,
  ): Promise<any> {
    try {
      const blobService = await this.getBlobServiceInstance();
      const containerClient = blobService.getContainerClient(containerName);
      folderName = folderName.replace(/\/$/, '');
      const blockBlobClient = containerClient.getBlockBlobClient(
        `${folderName}/${filename}`,
      );
      return blockBlobClient;
    } catch (error) {
      console.log(error);
    }
  }

  public async uploadFile(options: any) {
    try {
      const blockBlobClient = await this.getBlobClient(
        options.container_name,
        options.folder_name,
        options.file_name,
      );
      const data = {
        fileUrl: blockBlobClient.url,
        file_name: blockBlobClient.name,
      };
      await blockBlobClient.uploadFile(options.imagePath);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async readStream(containerName: any, folderName: any, filename: any) {
    try {
      const blockBlobClient: any = await this.getBlobClient(
        containerName,
        folderName,
        filename,
      );
      const data = {
        fileUrl: blockBlobClient.url,
      };
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteAzureFile(
    containerName: string,
    folderName: any,
    fileName: string,
  ) {
    try {
      const blockBlobClient = await this.getBlobClient(
        containerName,
        folderName,
        fileName,
      );
      return await blockBlobClient.deleteIfExists();
    } catch (error) {
      console.log(error);
    }
  }
}
