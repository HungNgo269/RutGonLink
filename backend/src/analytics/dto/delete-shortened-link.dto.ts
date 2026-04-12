export class DeleteShortenedLinkDto {
  constructor(
    public readonly shortCode: string,
    public readonly deleted: boolean,
  ) {}
}
