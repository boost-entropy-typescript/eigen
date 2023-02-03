import { bullet } from "@artsy/palette-mobile"
import { FlexProps } from "app/Components/Bidding/Elements/Flex"
import { BillingAddress } from "app/Components/Bidding/Screens/BillingAddress"
import { CreditCardForm } from "app/Components/Bidding/Screens/CreditCardForm"
import { Address, PaymentCardTextFieldParams, StripeToken } from "app/Components/Bidding/types"
import NavigatorIOS from "app/utils/__legacy_do_not_use__navigator-ios-shim"
import React from "react"
import { View } from "react-native"

import { BidInfoRow } from "./BidInfoRow"
import { Divider } from "./Divider"

interface PaymentInfoProps extends FlexProps {
  navigator?: NavigatorIOS
  onCreditCardAdded: (t: StripeToken, p: PaymentCardTextFieldParams) => void
  onBillingAddressAdded: (values: Address) => void
  billingAddress?: Address | null
  creditCardFormParams?: PaymentCardTextFieldParams | null
  creditCardToken?: StripeToken | null
}

export class PaymentInfo extends React.Component<PaymentInfoProps> {
  constructor(props: PaymentInfoProps) {
    super(props)
  }

  presentCreditCardForm() {
    this.props.navigator?.push({
      component: CreditCardForm,
      title: "",
      passProps: {
        onSubmit: (token: StripeToken, params: PaymentCardTextFieldParams) =>
          this.onCreditCardAdded(token, params),
        params: this.props.creditCardFormParams,
        navigator: this.props.navigator,
      },
    })
  }

  presentBillingAddressForm() {
    this.props.navigator?.push({
      component: BillingAddress,
      title: "",
      passProps: {
        onSubmit: (address: Address) => this.onBillingAddressAdded(address),
        billingAddress: this.props.billingAddress,
        navigator: this.props.navigator,
      },
    })
  }

  onCreditCardAdded(token: StripeToken, params: PaymentCardTextFieldParams) {
    this.props.onCreditCardAdded(token, params)
  }

  onBillingAddressAdded(values: Address) {
    this.props.onBillingAddressAdded(values)
  }

  render() {
    const { billingAddress, creditCardToken: token } = this.props

    return (
      <View>
        <Divider />

        <BidInfoRow
          label="Credit card"
          value={token ? this.formatCard(token) : ""}
          onPress={() => this.presentCreditCardForm()}
        />

        <Divider />

        <BidInfoRow
          label="Billing address"
          value={billingAddress ? this.formatAddress(billingAddress) : ""}
          onPress={() => {
            this.presentBillingAddressForm()
          }}
        />

        <Divider />
      </View>
    )
  }

  private formatCard(token: StripeToken) {
    return `${token.card.brand} ${bullet}${bullet}${bullet}${bullet} ${token.card.last4}`
  }

  private formatAddress(address: Address) {
    return [address.addressLine1, address.addressLine2, address.city, address.state]
      .filter((el) => el)
      .join(" ")
  }
}
