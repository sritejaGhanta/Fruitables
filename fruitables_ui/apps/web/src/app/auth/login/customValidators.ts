import { FormControl } from '@angular/forms';

export class CustomValidators {
  public static passwordsMatch(password: string, confirmedPassword: string) {
    console.log(password);
    return (control: FormControl): { [s: string]: boolean } => {
      console.log(password, 'here');
      //getting undefined values for both variables
      //if I change this condition to === it throws the error if the
      //  two fields are the same, so this part works
      if (password !== confirmedPassword) {
        return { passwordMatch: false };
      } else {
        //it always gets here no matter what
        return { passwordMatch: true };
      }
    };
  }
}
