import * as TE from '@fp/TaskEither'
import * as ContentTypeHelpers from 'content-type'
import { flow } from 'fp-ts/function'
import { Json } from 'fp-ts/Json'
import * as O from 'fp-ts/Option'

const CONTENT_TYPE_RESPONSE_HEADER = 'content-type'
const CONTENT_TYPE_JSON = 'application/json'

export class DecodingFailure {
  readonly _tag = 'DecodingFailure'
}

export class JsonParseError {
  readonly _tag = 'JsonParseError'
  constructor(readonly message: string) {}
}

export class NotJson {
  readonly _tag = 'NotJson'
}

export class FetchError {
  readonly _tag = 'FetchError'
  constructor(readonly message: string) {}
}

export type FetchOrDecodingErrors =
  | FetchError
  | NotJson
  | JsonParseError
  | DecodingFailure

export const fromFetch = TE.tryCatchK(
  fetch,
  flow(
    (error) => (error instanceof Error ? error.message : 'Unknown error.'),
    (message) => new FetchError(message),
  ),
)

const checkIsJson = flow(
  (response: Response) => response.headers.get(CONTENT_TYPE_RESPONSE_HEADER),
  O.fromNullable,
  O.map(flow(ContentTypeHelpers.parse, (result) => result.type)),
  O.exists((type) => type === CONTENT_TYPE_JSON),
)

export const getJson = (
  response: Response,
): TE.TaskEither<NotJson | JsonParseError, Json> =>
  checkIsJson(response)
    ? TE.tryCatch(
        () => response.json() as Promise<Json>,
        (error) =>
          new JsonParseError(
            error instanceof Error ? error.message : 'Unknown error.',
          ),
      )
    : TE.left(new NotJson())
