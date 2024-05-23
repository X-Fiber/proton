import { colors, dateFns } from "~packages";

import type { Color, UTCDate, NLoggerService, ModeObject } from "~types";

export class Helpers {
  public static addBrackets(str: string): string {
    return " [ " + str + " ] ";
  }

  public static addLevel(
    level: string,
    bg: keyof Color.Color,
    color: keyof Color.Color
  ) {
    const spacesToAdd = 11 - level.length;

    const leftSpaces = Math.floor(spacesToAdd / 2);
    const rightSpaces = spacesToAdd - leftSpaces;

    return colors[bg][color](
      " ".repeat(leftSpaces) + level.toUpperCase() + " ".repeat(rightSpaces)
    );
  }

  public static centralized(maxLength: number, str: string): string {
    const spacesToAdd = maxLength - str.length;

    const leftSpaces = Math.floor(spacesToAdd / 2);
    const rightSpaces = spacesToAdd - leftSpaces;

    return " ".repeat(leftSpaces) + str + " ".repeat(rightSpaces);
  }

  public static switchChecker(variant: never | any): Error {
    return new Error("Not implemented");
  }

  public static levelConsoleLog(
    msg: string,
    color: keyof Color.Color,
    loggerLevels:
      | keyof NLoggerService.CoreLoggerLevels
      | keyof NLoggerService.SchemaLoggerLevels,
    service?: string,
    levelColors?: keyof Color.Color,
    levelBgColors?: keyof Color.Color
  ): void {
    let namespace: string = "";
    if (service) {
      namespace = Helpers.addBrackets(Helpers.centralized(20, service));
    }
    const level = Helpers.addLevel(
      loggerLevels,
      levelBgColors ?? "bgMagenta",
      levelColors ?? "green"
    );

    const log =
      dateFns.format(new Date(), "yyyy-MM-dd HH:mm:ss") +
      " " +
      level +
      namespace +
      msg;
    console.log(colors[color](log));
  }

  public static get UTCDate(): UTCDate {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
      timeZone: "UTC",
    };

    const formattedDate = now.toLocaleDateString("en-US", options);
    const [date, time] = formattedDate.split(" ");
    const [month, day, year] = date.replace(",", "").split("/");

    return {
      date: day + ":" + month + ":" + year,
      time: time,
      utc: "0",
    };
  }

  public static parseQueryParams(query: ModeObject): ModeObject {
    return Object.keys(query).reduce((parsedQuery: ModeObject, key: string) => {
      const value = query[key];
      parsedQuery[key] = Array.isArray(value)
        ? value.map(Helpers.parseValue)
        : Helpers.parseValue(value);
      return parsedQuery;
    }, {});
  }

  public static parseValue(
    value: string | number | boolean
  ): string | number | boolean {
    if (!isNaN(Number(value))) {
      return Number(value);
    } else if (value === "true") {
      return true;
    } else if (value === "false") {
      return false;
    }

    return value;
  }

  public static getRouteUniqueName(
    method: string,
    version: string,
    action: string
  ): string {
    return `${method.toUpperCase()}.${version}.${action}`;
  }

  public static getStreamUniqueName(version: string, action: string): string {
    return `${version}.${action}`;
  }

  public static getEventUniqueName(
    type: string,
    version: string,
    event: string
  ): string {
    return `${type}.${version}.${event}`;
  }
}
