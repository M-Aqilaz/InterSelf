/** An expected, user-facing failure with an HTTP status. */
export class GameError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
    this.name = "GameError";
  }
}
