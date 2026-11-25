// https://www.jvandemo.com/how-to-use-environment-variables-to-configure-your-angular-application-without-a-rebuild/
(function (window) {
  window.__env = window.__env || {};

  // environment-dependent settings
  window.__env.apiUrl = "http://localhost:5078/api/";
  window.__env.version = "5.0.2";
  // enable thesaurus import in thesaurus list for admins
  window.__env.thesImportEnabled = true;

  // enable history UI
  window.__env.historyEnabled = true;

  // URL template for help pages
  window.__env.helpUrlTemplate = [
    "https://vedph.github.io/cadmus-help[-{language}]/parts/{typeId}{separator}{roleId}{separator}{frRoleId}.html",
  ];
  // value of {separator} (optional, default: __)
  window.__env.helpUrlSeparator = "__";
  // false to skip checking page availability (optional, default: true)
  window.__env.helpUrlCheck = true;
})(this);
