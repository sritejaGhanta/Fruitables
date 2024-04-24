import { Controller, UseFilters, Post, Req, Request, Body, Put, Param, BadRequestException, UploadedFiles, UseInterceptors, Get, Query, Delete } from '@nestjs/common';
import { validate } from 'class-validator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { DashboardProductsExtendedService } from './services/extended/dashboard_products.extended.service';
import { FaqAddService } from './services/faq_add.service';
import { FaqListExtendedService } from './services/extended/faq_list.extended.service';
import { FaqUpdateService } from './services/faq_update.service';
import { ProductCategoryAddService } from './services/product_category_add.service';
import { ProductCategoryAutocompleteService } from './services/product_category_autocomplete.service';
import { ProductCategoryChangeStatusService } from './services/product_category_change_status.service';
import { ProductCategoryDeleteService } from './services/product_category_delete.service';
import { ProductCategoryDetailsService } from './services/product_category_details.service';
import { ProductCategoryListExtendedService } from './services/extended/product_category_list.extended.service';
import { ProductCategoryUpdateExtendedService } from './services/extended/product_category_update.extended.service';
import { ProductReviewsAddService } from './services/product_reviews_add.service';
import { ProductReviewsDeleteService } from './services/product_reviews_delete.service';
import { ProductReviewsListExtendedService } from './services/extended/product_reviews_list.extended.service';
import { ProductReviewsUpdateService } from './services/product_reviews_update.service';
import { ProductsAddService } from './services/products_add.service';
import { ProductsAutocompleteService } from './services/products_autocomplete.service';
import { ProductsChangeStatusService } from './services/products_change_status.service';
import { ProductsDeleteService } from './services/products_delete.service';
import { ProductsDetailsService } from './services/products_details.service';
import { ProductsListExtendedService } from './services/extended/products_list.extended.service';
import { ProductsUpdateService } from './services/products_update.service';
import { RmqGetProductDetailsService } from './services/rmq_get_product_details.service';
import { RmqGetProductsListService } from './services/rmq_get_products_list.service';
import { FaqAddDto } from './dto/faq_add.dto';
import { FaqListDto } from './dto/faq_list.dto';
import { FaqUpdateDto, FaqUpdateParamDto } from './dto/faq_update.dto';
import { ProductCategoryAddDto, ProductCategoryAddFileDto } from './dto/product_category_add.dto';
import { ProductCategoryAutocompleteDto } from './dto/product_category_autocomplete.dto';
import { ProductCategoryChangeStatusDto } from './dto/product_category_change_status.dto';
import { ProductCategoryDeleteDto, ProductCategoryDeleteParamDto } from './dto/product_category_delete.dto';
import { ProductCategoryDetailsDto, ProductCategoryDetailsParamDto } from './dto/product_category_details.dto';
import { ProductCategoryListDto } from './dto/product_category_list.dto';
import { ProductCategoryUpdateDto, ProductCategoryUpdateParamDto, ProductCategoryUpdateFileDto } from './dto/product_category_update.dto';
import { ProductReviewsAddDto } from './dto/product_reviews_add.dto';
import { ProductReviewsDeleteDto, ProductReviewsDeleteParamDto } from './dto/product_reviews_delete.dto';
import { ProductReviewsListDto } from './dto/product_reviews_list.dto';
import { ProductReviewsUpdateDto, ProductReviewsUpdateParamDto } from './dto/product_reviews_update.dto';
import { ProductsAddDto } from './dto/products_add.dto';
import { ProductsAutocompleteDto } from './dto/products_autocomplete.dto';
import { ProductsChangeStatusDto } from './dto/products_change_status.dto';
import { ProductsDeleteDto, ProductsDeleteParamDto } from './dto/products_delete.dto';
import { ProductsDetailsDto, ProductsDetailsParamDto } from './dto/products_details.dto';
import { ProductsListDto } from './dto/products_list.dto';
import { ProductsUpdateDto, ProductsUpdateParamDto } from './dto/products_update.dto';
import { RmqGetProductDetailsDto } from './dto/rmq_get_product_details.dto';
import { RmqGetProductsListDto } from './dto/rmq_get_products_list.dto';

@Controller()
@UseFilters(HttpExceptionFilter)
export class GatewayProductController {
  constructor(
    protected readonly general: CitGeneralLibrary,
    private dashboardProductsService: DashboardProductsExtendedService,
    private faqAddService: FaqAddService,
    private faqListService: FaqListExtendedService,
    private faqUpdateService: FaqUpdateService,
    private productCategoryAddService: ProductCategoryAddService,
    private productCategoryAutocompleteService: ProductCategoryAutocompleteService,
    private productCategoryChangeStatusService: ProductCategoryChangeStatusService,
    private productCategoryDeleteService: ProductCategoryDeleteService,
    private productCategoryDetailsService: ProductCategoryDetailsService,
    private productCategoryListService: ProductCategoryListExtendedService,
    private productCategoryUpdateService: ProductCategoryUpdateExtendedService,
    private productReviewsAddService: ProductReviewsAddService,
    private productReviewsDeleteService: ProductReviewsDeleteService,
    private productReviewsListService: ProductReviewsListExtendedService,
    private productReviewsUpdateService: ProductReviewsUpdateService,
    private productsAddService: ProductsAddService,
    private productsAutocompleteService: ProductsAutocompleteService,
    private productsChangeStatusService: ProductsChangeStatusService,
    private productsDeleteService: ProductsDeleteService,
    private productsDetailsService: ProductsDetailsService,
    private productsListService: ProductsListExtendedService,
    private productsUpdateService: ProductsUpdateService,
    private rmqGetProductDetailsService: RmqGetProductDetailsService,
    private rmqGetProductsListService: RmqGetProductsListService,
  ) {}

  @Post('dashboard-products')
  async dashboardProducts(@Req() request: Request, @Body() body) {
    const params = body;
    return await this.dashboardProductsService.startDashboardProducts(request, params);
  }

  @Post('faq-add')
  async faqAdd(@Req() request: Request, @Body() body: FaqAddDto) {
    const params = body;
    return await this.faqAddService.startFaqAdd(request, params);
  }

  @Post('faq-list')
  async faqList(@Req() request: Request, @Body() body: FaqListDto) {
    const params = body;
    return await this.faqListService.startFaqList(request, params);
  }

  @Put('faq-update/:id')
  async faqUpdate(@Req() request: Request, @Param() param: FaqUpdateParamDto, @Body() body: FaqUpdateDto) {
    const params = { ...param, ...body };
    return await this.faqUpdateService.startFaqUpdate(request, params);
  }

  @Post('product-category-add')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'category_images' },
  ]))
  async productCategoryAdd(@Req() request: Request, @Body() body: ProductCategoryAddDto, @UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const params = body;

    const fileDto = new ProductCategoryAddFileDto();
    fileDto.category_images = files?.category_images;
    const errors = await validate(fileDto, { whitelist: true });

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => {
          if (error.hasOwnProperty('constraints')) {
            return Object.values(error.constraints);
          } else {
            return [];
          }
        })
        .flat();
      if (errorMessages.length > 0) {
        const response = {
          statusCode: 400,
          message: 'Validation failed',
          errors: errorMessages,
        };
        throw new BadRequestException(response);
      }
    }

    const uploadPromises = [];
    if (typeof files !== 'undefined' && Object.keys(files).length > 0) {
      for (const [key, value] of Object.entries(files)) {
        const fieldFiles = files[key];
        for (const file of fieldFiles) {
          const fileName = await this.general.temporaryUpload(file);
          uploadPromises.push(fileName);
          params[key] = fileName;
        }
      }
    }
    await Promise.all(uploadPromises);

    return await this.productCategoryAddService.startProductCategoryAdd(request, params);
  }

  @Get('product-category-autocomplete')
  async productCategoryAutocomplete(@Req() request: Request, @Query() query: ProductCategoryAutocompleteDto) {
    const params = { ...query };
    return await this.productCategoryAutocompleteService.startProductCategoryAutocomplete(request, params);
  }

  @Post('product-category-change-status')
  async productCategoryChangeStatus(@Req() request: Request, @Body() body: ProductCategoryChangeStatusDto) {
    const params = body;
    return await this.productCategoryChangeStatusService.startProductCategoryChangeStatus(request, params);
  }

  @Delete('product-category-delete/:id')
  async productCategoryDelete(@Req() request: Request, @Param() param: ProductCategoryDeleteParamDto, @Body() body: ProductCategoryDeleteDto) {
    const params = { ...param, ...body };
    return await this.productCategoryDeleteService.startProductCategoryDelete(request, params);
  }

  @Get('product-category-details/:id')
  async productCategoryDetails(@Req() request: Request, @Param() param: ProductCategoryDetailsParamDto, @Query() query: ProductCategoryDetailsDto) {
    const params = { ...param, ...query };
    return await this.productCategoryDetailsService.startProductCategoryDetails(request, params);
  }

  @Post('product-category-list')
  async productCategoryList(@Req() request: Request, @Body() body: ProductCategoryListDto) {
    const params = body;
    return await this.productCategoryListService.startProductCategoryList(request, params);
  }

  @Put('product-category-update/:id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'category_images' },
  ]))
  async productCategoryUpdate(@Req() request: Request, @Param() param: ProductCategoryUpdateParamDto, @Body() body: ProductCategoryUpdateDto, @UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const params = { ...param, ...body };

    const fileDto = new ProductCategoryUpdateFileDto();
    fileDto.category_images = files?.category_images;
    const errors = await validate(fileDto, { whitelist: true });

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => {
          if (error.hasOwnProperty('constraints')) {
            return Object.values(error.constraints);
          } else {
            return [];
          }
        })
        .flat();
      if (errorMessages.length > 0) {
        const response = {
          statusCode: 400,
          message: 'Validation failed',
          errors: errorMessages,
        };
        throw new BadRequestException(response);
      }
    }

    const uploadPromises = [];
    if (typeof files !== 'undefined' && Object.keys(files).length > 0) {
      for (const [key, value] of Object.entries(files)) {
        const fieldFiles = files[key];
        for (const file of fieldFiles) {
          const fileName = await this.general.temporaryUpload(file);
          uploadPromises.push(fileName);
          params[key] = fileName;
        }
      }
    }
    await Promise.all(uploadPromises);

    return await this.productCategoryUpdateService.startProductCategoryUpdate(request, params);
  }

  @Post('product-reviews-add')
  async productReviewsAdd(@Req() request: Request, @Body() body: ProductReviewsAddDto) {
    const params = body;
    return await this.productReviewsAddService.startProductReviewsAdd(request, params);
  }

  @Delete('product-reviews-delete/:id')
  async productReviewsDelete(@Req() request: Request, @Param() param: ProductReviewsDeleteParamDto, @Body() body: ProductReviewsDeleteDto) {
    const params = { ...param, ...body };
    return await this.productReviewsDeleteService.startProductReviewsDelete(request, params);
  }

  @Post('product-reviews-list')
  async productReviewsList(@Req() request: Request, @Body() body: ProductReviewsListDto) {
    const params = body;
    return await this.productReviewsListService.startProductReviewsList(request, params);
  }

  @Put('product-reviews-update/:id')
  async productReviewsUpdate(@Req() request: Request, @Param() param: ProductReviewsUpdateParamDto, @Body() body: ProductReviewsUpdateDto) {
    const params = { ...param, ...body };
    return await this.productReviewsUpdateService.startProductReviewsUpdate(request, params);
  }

  @Post('products-add')
  async productsAdd(@Req() request: Request, @Body() body: ProductsAddDto) {
    const params = body;
    return await this.productsAddService.startProductsAdd(request, params);
  }

  @Get('products-autocomplete')
  async productsAutocomplete(@Req() request: Request, @Query() query: ProductsAutocompleteDto) {
    const params = { ...query };
    return await this.productsAutocompleteService.startProductsAutocomplete(request, params);
  }

  @Post('products-change-status')
  async productsChangeStatus(@Req() request: Request, @Body() body: ProductsChangeStatusDto) {
    const params = body;
    return await this.productsChangeStatusService.startProductsChangeStatus(request, params);
  }

  @Delete('products-delete/:id')
  async productsDelete(@Req() request: Request, @Param() param: ProductsDeleteParamDto, @Body() body: ProductsDeleteDto) {
    const params = { ...param, ...body };
    return await this.productsDeleteService.startProductsDelete(request, params);
  }

  @Get('products-details/:id')
  async productsDetails(@Req() request: Request, @Param() param: ProductsDetailsParamDto, @Query() query: ProductsDetailsDto) {
    const params = { ...param, ...query };
    return await this.productsDetailsService.startProductsDetails(request, params);
  }

  @Post('products-list')
  async productsList(@Req() request: Request, @Body() body: ProductsListDto) {
    const params = body;
    return await this.productsListService.startProductsList(request, params);
  }

  @Put('products-update/:id')
  async productsUpdate(@Req() request: Request, @Param() param: ProductsUpdateParamDto, @Body() body: ProductsUpdateDto) {
    const params = { ...param, ...body };
    return await this.productsUpdateService.startProductsUpdate(request, params);
  }

  @MessagePattern('rmq_product_details')
  async rmqGetProductDetails(@Payload() body) {
    const params = body;
    const request = {};
                
    return await this.rmqGetProductDetailsService.startRmqGetProductDetails(request, params);
  }

  @MessagePattern('rmq_get_product_list')
  async rmqGetProductsList(@Payload() body) {
    const params = body;
    const request = {};
                
    return await this.rmqGetProductsListService.startRmqGetProductsList(request, params);
  }

}
