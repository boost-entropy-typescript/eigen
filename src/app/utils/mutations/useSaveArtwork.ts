import { refreshOnArtworkSave } from "app/utils/refreshHelpers"
import { useMutation } from "react-relay"
import { graphql } from "relay-runtime"

export interface SaveArtworkOptions {
  id: string
  internalID: string
  isSaved: boolean | null
  onCompleted?: (isSaved: boolean) => void
  onError?: () => void
}

export const useSaveArtwork = ({
  id,
  internalID,
  isSaved,
  onCompleted,
  onError,
}: SaveArtworkOptions) => {
  const [commit] = useMutation(SaveArtworkMutation)
  const nextSavedState = !isSaved

  return () => {
    commit({
      variables: {
        input: {
          artworkID: internalID,
          remove: isSaved,
        },
      },
      optimisticResponse: {
        saveArtwork: {
          artwork: {
            id,
            isSaved: nextSavedState,
          },
        },
      },
      onCompleted: () => {
        refreshOnArtworkSave()
        onCompleted?.(nextSavedState)
      },
      onError: () => {
        onError?.()
      },
    })
  }
}

const SaveArtworkMutation = graphql`
  mutation useSaveArtworkMutation($input: SaveArtworkInput!) {
    saveArtwork(input: $input) {
      artwork {
        id
        isSaved
      }
    }
  }
`
