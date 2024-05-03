import { Injectable } from '@nestjs/common';

import { ProductReviewsListService } from '../product_reviews_list.service';

@Injectable()
export class ProductReviewsListExtendedService extends ProductReviewsListService {
  getWhereClause(queryObject, inputParams, extraConfig) {
    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaWhere(
      inputParams,
      aliasList,
      queryObject,
    );
    if ('keyword' in inputParams && inputParams.keyword) {
      let condition = `(pr.tReview LIKE%${inputParams.keyword}% OR pr.fRating LIKE%${inputParams.keyword}%)`;
      queryObject.where(condition);
    }
  }

  getColumnAliases() {
    return {
      id: 'pr.id',
      createdAt: 'pr.createdAt',
      product_id: 'pr.iProductId',
      user_id: 'pr.iUserId',
      review: 'pr.tReview',
      rating: 'pr.fRating',
    };
  }

  updateUser(inputParams: any) {
    let user = inputParams.get_rmq_user_detail;
    console.log(inputParams);
    if (inputParams.get_product_reviews_list) {
      inputParams.get_product_reviews_list?.forEach(
        (element: any, key: any) => {
          if (user.user_id == element.pr_user_id) {
            inputParams.get_product_reviews_list[key] = {
              ...inputParams.get_product_reviews_list[key],
              user_name: `${user.first_name}  ${user.last_name}`,
              user_email: user.email,
              user_profile_image: user.profile_image,
            };
          }
        },
      );
    } else {
      let user = inputParams.get_rmq_user_details;
      inputParams.user_name = `${user.first_name}  ${user.last_name}`;
      inputParams.user_email = user.email;
      inputParams.user_profile_image = user.profile_image;
    }
  }
}
