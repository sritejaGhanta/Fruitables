import { Injectable } from '@nestjs/common';

import { GetTop5RatingsService } from '../get_top_5_ratings.service';

@Injectable()
export class GetTop5RatingsExtendedService extends GetTop5RatingsService {
  getUserIds(inputParams) {
    return {
      ids: inputParams.get_comments.map((e) => e.pr_user_id),
    };
  }

  prepareData(inputParams) {
    let users = {};
    inputParams.external_api.map((e) => {
      users[e.user_id] = e;
    });

    let reviews = [];

    inputParams.get_comments.map((e) => {
      let userData = users[e.pr_user_id];
      reviews.push({
        ...e,
        pr_name: userData.first_name + ' ' + userData.last_name,
        pr_email: userData.email,
        pr_phone_number: userData.dial_code + ' ' + userData.phone_number,
        pr_profile_image: userData.profile_image,
        pr_status: userData.status,
      });
    });
    inputParams.get_comments = reviews;
  }
}
