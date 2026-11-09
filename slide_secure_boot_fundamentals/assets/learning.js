(function () {
  "use strict";

  function hex(bytes) {
    return Array.from(new Uint8Array(bytes), function (value) {
      return value.toString(16).padStart(2, "0");
    }).join("");
  }

  async function install() {
    var lab = document.getElementById("crypto-lab");
    if (!lab || lab.dataset.installed) { return; }
    lab.dataset.installed = "true";
    var status = lab.querySelector("[data-lab-status]");
    var controls = Array.from(lab.querySelectorAll("input"));
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle || !window.TextEncoder) {
      lab.querySelectorAll("dd").forEach(function (field) { field.textContent = "未執行"; });
      status.textContent = "此環境無法執行 Web Crypto；下方對照表提供三種情境的預期結果。HTTPS 或 localhost 可搭配支援的瀏覽器執行。";
      lab.dataset.ready = "unavailable";
      return;
    }

    try {
      var algorithm = { name: "ECDSA", namedCurve: "P-256" };
      var trusted = await subtle.generateKey(algorithm, false, ["sign", "verify"]);
      var other = await subtle.generateKey(algorithm, false, ["sign", "verify"]);
      var original = new TextEncoder().encode("Firmware demo v1.0\nsecurity-counter=7\n");
      var signatureAlgorithm = { name: "ECDSA", hash: "SHA-256" };
      var signed = await subtle.sign(signatureAlgorithm, trusted.privateKey, original);
      var otherSigned = await subtle.sign(signatureAlgorithm, other.privateKey, original);
      var originalHash = hex(await subtle.digest("SHA-256", original));
      var publicKey = await subtle.exportKey("spki", trusted.publicKey);
      lab.querySelector("[data-lab-key]").textContent = hex(await subtle.digest("SHA-256", publicKey));
      lab.querySelector("[data-lab-original]").textContent = originalHash;
      var run = 0;

      async function show(value) {
        var current = ++run;
        try {
          var data = new Uint8Array(original);
          if (value === "tampered") { data[0] ^= 1; }
          var signature = value === "wrong-key" ? otherSigned : signed;
          var hash = hex(await subtle.digest("SHA-256", data));
          var verified = await subtle.verify(signatureAlgorithm, trusted.publicKey, signature, data);
          if (current !== run) { return; }
          lab.querySelector("[data-lab-current]").textContent = hash;
          lab.querySelector("[data-lab-hash]").textContent = hash === originalHash ? "與原始內容相同" : "與原始內容不同";
          lab.querySelector("[data-lab-signature]").textContent = verified ? "驗章通過" : "驗章失敗";
          status.textContent = verified ? "內容與可信金鑰的簽章相符。完整裝置仍須檢查格式、版本與執行條件。" :
            value === "wrong-key" ? "Hash 相同仍無法通過：簽署者不對應裝置信任的公鑰。" : "內容改變，原簽章無法驗證修改後的資料。";
          lab.dataset.result = verified ? "pass" : "fail";
          lab.dataset.scenario = value;
          lab.dataset.ready = "true";
        } catch (error) {
          status.textContent = "驗證未完成；下方表格可查閱預期結果。";
          lab.dataset.result = "unavailable";
          lab.dataset.ready = "unavailable";
        }
      }

      controls.forEach(function (control) {
        control.disabled = false;
        control.addEventListener("change", function () { if (control.checked) { show(control.value); } });
      });
      await show("valid");
    } catch (error) {
      status.textContent = "此瀏覽器未完成示範金鑰初始化；下方對照表仍可閱讀。";
      lab.dataset.ready = "unavailable";
    }
  }

  window.addEventListener("guide:ready", install);
}());
