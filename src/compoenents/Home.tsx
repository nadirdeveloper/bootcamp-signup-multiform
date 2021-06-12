import { Box, Button, Card, CardContent, CircularProgress, Grid, Step, StepLabel, Stepper } from '@material-ui/core';
import { Field, Form, Formik, FormikConfig, FormikValues } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import { boolean, mixed, number, object,string } from 'yup';

const sleep = (time:any) => new Promise((acc) => setTimeout(acc, time));

export default function Home() {
  
  return (
    <Card>
      <CardContent>
        <FormikStepper
          initialValues={{
            firstName: '',
            lastName: '',
            emailAddress:'',
            financially: false,
            phoneNo: '',
            address: '',
            fees: 0,
          }}
          onSubmit={async (values:any) => {
            await sleep(3000);
            console.log('values', values);
            alert("Thank you for Signing Up");
            window.location.reload();
          }}
          // validationSchema={}
        >
          <FormikStep
          validationSchema={object({
            firstName: string()
              .required("Required FirstName")
              .max(10, "Should be less than 10"),
            lastName: string()
              .required("Required LastName")
              .max(10, "Should be less than 10"),
              financially: boolean(),
                     emailAddress: string()
            .required("Required Email")
              .email("Invalid email address"),
       
          })}
          label="Personal Data">
            <Box paddingBottom={2}>
              <Field fullWidth name="firstName" component={TextField} label="First Name"
              // validationSchema={}
              />
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="lastName" component={TextField} label="Last Name" />
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="emailAddress" component={TextField} label="Email Address" />
            </Box>
            <Box paddingBottom={2}>
              <Field
                name="financially"
                type="checkbox"
                component={CheckboxWithLabel}
                Label={{ label: 'I am a financially strong' }}
              />
            </Box>
          </FormikStep>
          <FormikStep
            label="Fees Details"
            validationSchema={object({
                   
              fees: mixed().when('financially', {
                is: true,
                then: number()
                  .required()
                  .min(
                    1_000,
                    'Because you said you are a financially strong so you pay at least 1000 rupees fees'
                  ),
                otherwise: number().required(),
              }),
            })}
          >
            <Box paddingBottom={2}>
              <Field
                fullWidth
                name="fees"
                type="number"
                component={TextField}
                label="Fees I can pay is"
              />
            </Box>
          </FormikStep>
          <FormikStep 
          label="Contact Details"
          validationSchema={object({
            phoneNo:string().min(11, "At least 11 characters").required("Required Phone No"),
            address:string().required("Required Address"),
          })}
          >
            <Box paddingBottom={2}>
              <Field fullWidth name="phoneNo" component={TextField} label="Phone Number" />
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="address" component={TextField} label="Address" />
            </Box>
          </FormikStep>
        </FormikStepper>
      </CardContent>
    </Card>
  );
}

export interface FormikStepProps
  extends Pick<FormikConfig<FormikValues>, 'children' | 'validationSchema'> {
  label: string;
}

export function FormikStep({ children }: FormikStepProps) {
  return <>{children}</>;
}

export function FormikStepper({ children, ...props }: FormikConfig<FormikValues>) {
  const childrenArray = React.Children.toArray(children) as React.ReactElement<FormikStepProps>[];
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step];
  const [completed, setCompleted] = useState(false);
  function isLastStep() {
    return step === childrenArray.length - 1;
  }

  return (
    <Formik
      {...props}
      validationSchema={currentChild.props.validationSchema}
      onSubmit={async (values, helpers) => {
        if (isLastStep()) {
          await props.onSubmit(values, helpers);
          setCompleted(true);
        } else {
          setStep((s) => s + 1);

          // the next line was not covered in the youtube video
          //
          // If you have multiple fields on the same step
          // we will see they show the validation error all at the same time after the first step!
          //
          // If you want to keep that behaviour, then, comment the next line :)
          // If you want the second/third/fourth/etc steps with the same behaviour
          //    as the first step regarding validation errors, then the next line is for you! =)
          //
          // In the example of the video, it doesn't make any difference, because we only
          //    have one field with validation in the second step :)
          helpers.setTouched({});
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form autoComplete="off">
          <Stepper alternativeLabel activeStep={step}>
            {childrenArray.map((child, index) => (
              <Step key={child.props.label} completed={step > index || completed}>
                <StepLabel>{child.props.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {currentChild}

          <Grid container spacing={2}>
            {step > 0 ? (
              <Grid item>
                <Button
                  disabled={isSubmitting}
                  variant="contained"
                  color="primary"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              </Grid>
            ) : null}
            <Grid item>
              <Button
                startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                disabled={isSubmitting}
                variant="contained"
                color="primary"
                type="submit"
              >
                {isSubmitting ? 'Submitting' : isLastStep() ? 'Submit' : 'Next'}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}