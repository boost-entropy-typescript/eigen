import { Box, Text, Button } from "@artsy/palette-mobile"
import { Container } from "app/Components/Bidding/Components/Containers"
import { PaymentCardTextFieldParams } from "app/Components/Bidding/types"
import { BottomAlignedButtonWrapper } from "app/Components/Buttons/BottomAlignedButtonWrapper"
import { FancyModalHeader } from "app/Components/FancyModal/FancyModalHeader"
import NavigatorIOS from "app/utils/__legacy_do_not_use__navigator-ios-shim"
import React, { Component } from "react"
import { ScrollView, View } from "react-native"
import { LiteCreditCardInput } from "react-native-credit-card-input"
// @ts-expect-error
import stripe, { StripeToken } from "tipsi-stripe"

interface CreditCardFormProps {
  navigator: NavigatorIOS
  params?: PaymentCardTextFieldParams
  onSubmit: (t: StripeToken, p: PaymentCardTextFieldParams) => void
}

interface CreditCardFormState {
  valid: boolean | null
  params: Partial<PaymentCardTextFieldParams>
  isLoading: boolean
  isError: boolean
}

export class CreditCardForm extends Component<CreditCardFormProps, CreditCardFormState> {
  private paymentInfo: React.RefObject<LiteCreditCardInput>

  constructor(props: CreditCardFormProps) {
    super(props)

    this.paymentInfo = (React as any).createRef()
    this.state = { valid: null, params: { ...this.props.params }, isLoading: false, isError: false }
  }

  componentDidMount() {
    if (this.paymentInfo.current) {
      this.paymentInfo.current.focus()
      if (this.props.params) {
        this.paymentInfo.current.setValues({
          cvc: this.props.params.cvc,
          expiry:
            this.props.params.expMonth.toString().padStart(2, "0") +
            "/" +
            this.props.params.expYear.toString().padStart(2, "0"),
          number: this.props.params.number,
        })
      }
    }
  }

  tokenizeCardAndSubmit = async () => {
    this.setState({ isLoading: true, isError: false })

    const { params } = this.state

    try {
      const token = await stripe.createTokenWithCard({ ...params })
      // If the form is valid we can assume all params have been filled
      this.props.onSubmit(token, this.state.params as PaymentCardTextFieldParams)
      this.setState({ isLoading: false })
      this.props.navigator.pop()
    } catch (error) {
      console.error("CreditCardForm.tsx", error)
      this.setState({ isError: true, isLoading: false })
    }
  }

  render() {
    const buttonComponent = (
      <Box m={1}>
        <Button
          disabled={!this.state.valid}
          loading={this.state.isLoading}
          block
          width={100}
          onPress={this.state.valid ? () => this.tokenizeCardAndSubmit() : null}
        >
          Add credit card
        </Button>
      </Box>
    )

    const errorText = "There was an error. Please try again."

    return (
      <BottomAlignedButtonWrapper
        onPress={this.state.valid ? () => this.tokenizeCardAndSubmit() : undefined}
        buttonComponent={buttonComponent}
      >
        <FancyModalHeader onLeftButtonPress={() => this.props.navigator?.pop()}>
          Add credit card
        </FancyModalHeader>
        <ScrollView scrollEnabled={false}>
          <Container m={0}>
            <View>
              <Box m={1}>
                <Text variant="sm" mb={2}>
                  Card Information
                </Text>
                <LiteCreditCardInput
                  ref={this.paymentInfo}
                  onChange={({ valid, values }) => {
                    this.setState({
                      valid,
                      params: {
                        cvc: values.cvc,
                        expMonth: Number(values.expiry.split("/")[0]),
                        expYear: Number(values.expiry.split("/")[1]),
                        number: values.number,
                      },
                    })
                  }}
                />
                {!!this.state.isError && (
                  <Text variant="xs" mt={4} color="red100">
                    {errorText}
                  </Text>
                )}
                <Text variant="sm" mt="6" color="black60" textAlign="center">
                  Registration is free.
                  {"\n"}A valid credit card is required in order to bid. Please enter your credit
                  card information below. The name on your Artsy account must match the name on the
                  card.
                </Text>
              </Box>
            </View>
          </Container>
        </ScrollView>
      </BottomAlignedButtonWrapper>
    )
  }
}
