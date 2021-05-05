import { RequestConditionReport_artwork } from "__generated__/RequestConditionReport_artwork.graphql"
import { RequestConditionReport_me } from "__generated__/RequestConditionReport_me.graphql"
import { Modal } from "lib/Components/Modal"
import { flushPromiseQueue } from "lib/tests/flushPromiseQueue"
import { Button } from "palette"
import React from "react"
import { RequestConditionReport } from "../RequestConditionReport"
import { __deprecated_mountWithWrappers } from "lib/tests/renderWithWrappers"

const artwork: RequestConditionReport_artwork = {
  // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
  " $refType": null,
  internalID: "some-internal-id",
  slug: "pablo-picasso-guernica",
  saleArtwork: {
    internalID: "some-sale-internal-id",
  },
}
const me: RequestConditionReport_me = {
  // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
  " $refType": null,
  email: "someemail@testerino.net",
  internalID: "some-id",
}

describe("RequestConditionReport", () => {
  it("renders correctly", () => {
    // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
    const component = __deprecated_mountWithWrappers(<RequestConditionReport artwork={artwork} me={me} relay={null} />)
    const requestReportButton = component.find(Button).at(0)
    expect(requestReportButton.length).toEqual(1)

    expect(requestReportButton.render().text()).toContain("Request condition report")

    const modals = component.find(Modal)
    expect(modals.length).toEqual(2)

    const errorModal = modals.at(0)
    const successModal = modals.at(1)

    expect(errorModal.props().visible).toEqual(false)
    expect(successModal.props().visible).toEqual(false)
  })

  it.skip("shows an error modal on failure", async () => {
    // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
    const component = __deprecated_mountWithWrappers(<RequestConditionReport artwork={artwork} me={me} relay={null} />)
    component.instance().requestConditionReport = jest
      .fn()
      .mockReturnValue(Promise.reject(new Error("Condition report request failed")))
    component.update()
    const requestReportButton = component.find(Button).at(0)
    requestReportButton.props().onPress()
    expect(component.instance().requestConditionReport).toHaveBeenCalled()

    await flushPromiseQueue()

    component.update()
    const errorModal = component.find(Modal).at(0)
    const successModal = component.find(Modal).at(1)
    expect(errorModal.props().visible).toEqual(true)
    expect(successModal.props().visible).toEqual(false)
  })

  it.skip("shows a success modal on success", async () => {
    // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
    const component = __deprecated_mountWithWrappers(<RequestConditionReport artwork={artwork} me={me} relay={null} />)
    component.instance().requestConditionReport = jest
      .fn()
      .mockReturnValue(Promise.resolve({ requestConditionReport: true }))
    component.update()
    const requestReportButton = component.find(Button).at(0)
    requestReportButton.props().onPress()
    expect(component.instance().requestConditionReport).toHaveBeenCalled()

    await flushPromiseQueue()

    component.update()
    const errorModal = component.find(Modal).at(0)
    const successModal = component.find(Modal).at(1)
    expect(errorModal.props().visible).toEqual(false)
    expect(successModal.props().visible).toEqual(true)
  })
})
