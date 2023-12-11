import { join } from 'path';

export class FunctionUtils {
  public static RandomNumberGenerator(): number {
    return ~~(Math.random() * 90000 + 10000);
  }

  public static ListOfImagesForRequest(
    files: Express.Multer.File[],
    fileUploadPath: string,
  ) {
    if (files) {
      return files
        .map((file) =>
          join('http://localhost:3333/', fileUploadPath, file.filename),
        )
        .map((item) => item.replace('\\', '//').replace('\\', '/'));
    } else {
      return [];
    }
  }

  public static getTime(seconds: number) {
    let total: any = Math.round(seconds) / 60;
    let [minutes, percent] = String(total).split('.');
    let second: any = Math.round((+percent * 60) / 100)
      .toString()
      .substring(0, 2);
    let hour: any = 0;
    if (+minutes > 60) {
      total = +minutes / 60;
      const [h1, percent] = String(total).split('.');
      (hour = h1),
        (minutes = Math.round((+percent * 60) / 100)
          .toString()
          .substring(0, 2));
    }
    if (String(hour) == '1') hour = `0${hour}`;
    if (String(minutes) == '1') minutes = `0${minutes}`;
    if (String(second) == '1') second = `0${second}`;
    return `${hour} : ${minutes} : ${second}`;
  }
}
