/* jshint esversion: 8 */
export class FormConverter {
  static convertFormDataToJSON(formToConvert) {
    let json = {};
    for (const pair of formToConvert.entries()) {
      json[pair[0]] = pair[1];
    }
    return JSON.stringify(json);
  }


  static convertFormDataToQueryString(formToConvert) {
    let qString = [];
    for (const pair of formToConvert.entries()) {
      let key = encodeURIComponent(pair[0]),
          value = encodeURIComponent(pair[1]);
      qString.push(`${key}=${value}`);
    }
    return qString.join('&');
  }
}
