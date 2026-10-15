/* Browser regression check. Install Playwright separately; no runtime dependency. */
const { chromium } = require(process.env.FC26_PLAYWRIGHT_PATH || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const output = process.env.FC26_VISUAL_OUTPUT || "/private/tmp/fc26-visual";
const base = process.env.FC26_BASE_URL || "http://127.0.0.1:8765";
fs.mkdirSync(output, { recursive: true });
const seedPlayers = Array.from({ length: 25 }, (_, i) => ({
  id: `p${i}`,
  careerSaveId: "city",
  firstName: "Player",
  surname: [
    "O’Reilly",
    "Foden",
    "Alleyne",
    "Lewis",
    "Doyle",
    "Hamilton",
    "McAtee",
    "Stones",
    "Charles",
    "Mfuluni",
    "Medrano",
    "Heskey",
    "McAidoo",
    "Bettinelli",
    "Simpson-Pusey",
    "Wright",
    "Gyabi",
    "Brookes",
    "Burns",
    "Edwards",
    "Bolton",
    "Hamer",
    "Murphy",
    "Berry",
    "Harrington",
  ][i],
  seniority: i === 24 ? "Youth" : "Senior",
  position: ["CM", "CAM", "CB", "RB", "ST", "LM", "GK", "LB"][i % 8],
  ovrInitial: 84 - i,
  potentialMin: 80,
  potentialMax: 94,
  cost: i === 0 ? 1000000 : 0,
  sale: 0,
  active: i === 23 ? "N" : "Y",
  homegrown: i % 2 === 0,
  foot: i % 2 ? "R" : "L",
  createdAt: "2026-10-10T12:00:00.000Z",
}));
function fixture(login) {
  return `
    let signedIn = JSON.parse(sessionStorage.getItem('fixture-signed-in') || '${!login}');
    let players = ${JSON.stringify(seedPlayers)};
    let saves = JSON.parse(sessionStorage.getItem('fixture-saves') || 'null') || [{id:'city',title:'City RTG',createdAt:'2026-10-10T12:00:00.000Z',preferredFormation:'4-3-3'}, {id:'cfg',title:'CFG C2',createdAt:'2026-01-25T12:00:00.000Z'}, {id:'mcw',title:'MCWFC',createdAt:'2026-01-05T12:00:00.000Z'}];
    export async function initAws() {}
    export async function getSession() {if(globalThis.__fixtureSessionReady){globalThis.__fixtureSessionStarted=true;await globalThis.__fixtureSessionReady;}return {signedIn,user:{username:'fixture'}};}
    export async function listSaves() {return structuredClone(saves);}
    export async function listPlayers(id) {return structuredClone(players.filter(p=>p.careerSaveId===id));}
    export async function updateSave(id,patch) {const s=saves.find(s=>s.id===id);Object.assign(s,patch);sessionStorage.setItem('fixture-saves',JSON.stringify(saves));return structuredClone(s);}
    export async function updateSaveTitle(id,title) {return updateSave(id,{title});}
    export async function createSave(title) {const s={id:'new-save',title,createdAt:new Date().toISOString()};saves.push(s);sessionStorage.setItem('fixture-saves',JSON.stringify(saves));return s;}
    export async function deleteSave(id) {saves=saves.filter(s=>s.id!==id);sessionStorage.setItem('fixture-saves',JSON.stringify(saves));}
    export async function addPlayer(careerSaveId,player) {const p={...player,id:'new-player',careerSaveId};players.push(p);return p;}
    export async function updatePlayer(id,patch) {const p=players.find(p=>p.id===id);Object.assign(p,patch);return structuredClone(p);}
    export async function deletePlayer(id) {players=players.filter(p=>p.id!==id);}
    export async function warmPlayerMasterCache() {}
    export function getPlayerMasterCacheStatus() {return {ready:true,loadedCount:25};}
    export async function searchPlayerMaster() {return [{id:'master',firstName:'Jude',surname:'Bellingham',position:'CM',overall:90,potential:94,foot:'R'}];}
    export async function awsSignUp() {return {nextStep:{signUpStep:'CONFIRM_SIGN_UP'}};}
    export async function awsSignIn() {signedIn=true;sessionStorage.setItem('fixture-signed-in','true');}
    export async function awsSignOut() {signedIn=false;sessionStorage.setItem('fixture-signed-in','false');sessionStorage.setItem('fixture-signout-count',String(Number(sessionStorage.getItem('fixture-signout-count'))+1));}
  `;
}
(async () => {
  const { FORMATIONS } = await import(
    "data:text/javascript;base64," +
      Buffer.from(
        fs.readFileSync(
          require("node:path").join(__dirname, "../formations.js"),
          "utf8",
        ),
      ).toString("base64")
  );
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const report = {
    serviceMode: "local fixtures; no AWS calls or real camera/OCR",
    checks: [],
    screenshots: [],
  };
  async function open(screen, theme, width, height, checkLoading = false) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    await context.addInitScript(
      (theme) => localStorage.setItem("fc26-theme", theme),
      theme,
    );
    await context.route("**/awsClient.js", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: fixture(screen === "login"),
      }),
    );
    await context.route("https://esm.sh/aws-amplify@6/auth", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: "export async function confirmSignUp(){};export async function resendSignUpCode(){};",
      }),
    );
    await context.route(
      "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js",
      (route) =>
        route.fulfill({
          contentType: "text/javascript",
          body: "export default {};",
        }),
    );
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    let releaseNavigation;
    if (checkLoading) {
      await context.addInitScript(() => {
        window.__fixtureSessionReady = new Promise((resolve) => {
          window.__releaseFixtureSession = resolve;
        });
      });
      const navigationReady = new Promise((resolve) => {
        releaseNavigation = resolve;
      });
      await context.route("**/navigation.js", async (route) => {
        await navigationReady;
        await route.continue();
      });
    }
    await page.goto(
      `${base}/${screen === "dashboard" ? "index" : screen}.html${screen === "tracker" ? "?save=city" : ""}`,
      { waitUntil: checkLoading ? "commit" : "load" },
    );
    if (checkLoading) {
      await page.locator(".app-loading-status").waitFor();
      await page.locator(".app-header").waitFor({ state: "hidden" });
      assert.equal(await page.locator("main").isVisible(), false);
      assert.equal(await page.locator(".app-nav").isVisible(), false);
      assert.equal(await page.locator(".app-nav-brand").count(), 0);
      releaseNavigation();
      await page.waitForFunction(() => window.__fixtureSessionStarted);
      assert.equal(await page.locator(".app-nav-brand").count(), 1);
      assert.equal(await page.locator(".app-nav").isVisible(), false);
      assert.equal(await page.locator(".app-header").isVisible(), false);
      assert.equal(await page.locator("main").isVisible(), false);
      await page.screenshot({
        path: `${output}/loading-${screen}-${width}.png`,
      });
      await page.evaluate(() => window.__releaseFixtureSession());
    }
    if (screen === "tracker") await page.waitForSelector("#rows tr");
    if (screen === "dashboard") await page.waitForSelector("#save-rows tr");
    await page.evaluate(() => document.fonts.ready);
    if (screen !== "login") {
      assert.equal(await page.locator(".app-header").isVisible(), true);
      assert.equal(await page.locator("main").isVisible(), true);
      assert.equal(
        await page.locator(".app-loading-status").isVisible(),
        false,
      );
    }
    if (checkLoading) {
      report.checks.push({
        screen,
        theme,
        width,
        loading:
          "Delayed module and session: loading status first, navigation and page revealed together",
      });
    }
    const geometry = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      h1: getComputedStyle(document.querySelector("h1")).fontSize,
      field: document
        .querySelector("input:not([type=file]):not([type=checkbox])")
        ?.getBoundingClientRect().height,
      grid: document.querySelector(".grid")
        ? getComputedStyle(document.querySelector(".grid")).gridTemplateColumns
        : null,
      loadedFonts:
        document.fonts.check('12px "Rubik"') &&
        document.fonts.check('12px "Special Gothic Expanded One"'),
    }));
    assert.equal(
      geometry.document,
      width,
      `${screen} ${theme} ${width}: page overflow`,
    );
    assert.equal(geometry.h1, width <= 768 ? "24px" : "36px");
    assert.equal(
      geometry.loadedFonts,
      true,
      "Google fonts must load for visual comparison",
    );
    if (geometry.field) assert.equal(geometry.field, 40);
    if (screen === "login") {
      assert.equal(await page.locator(".app-nav").count(), 0);
    } else {
      const nav = page.locator('nav[aria-label="Application"]');
      assert.equal(await nav.isVisible(), true);
      const navBox = await nav.boundingBox();
      assert.equal(navBox.x, 0);
      assert.equal(navBox.width, width);
      assert.equal(navBox.height, 64);
      assert.equal(await nav.locator(".btn.btn-secondary").count(), 2);
      assert.equal(await page.locator("#btn-signout").count(), 1);
      assert.equal(await page.locator("#back-to-dashboard").count(), 1);
      assert.equal(
        await page
          .locator(".app-header #btn-signout, .app-header #back-to-dashboard")
          .count(),
        0,
      );
      assert.equal(
        await page.locator("#back-to-dashboard").getAttribute("aria-current"),
        screen === "dashboard" ? "page" : null,
      );
      const alignment = await page.evaluate(() => ({
        brand: document.querySelector(".app-nav-brand").getBoundingClientRect()
          .x,
        card: document.querySelector("main > .card").getBoundingClientRect().x,
        header: document.querySelector(".app-header").getBoundingClientRect().y,
      }));
      assert.equal(alignment.brand, alignment.card);
      assert.equal(alignment.header, 64);
      await page.keyboard.press("Tab");
      for (const id of ["back-to-dashboard", "btn-signout"]) {
        await page.locator(`#${id}`).focus();
        assert.equal(
          await page
            .locator(`#${id}`)
            .evaluate((el) => getComputedStyle(el).outlineStyle),
          "solid",
        );
      }
    }
    const file = `${screen}-${theme}-${width}.png`;
    await page.screenshot({ path: `${output}/${file}`, fullPage: true });
    report.screenshots.push(file);
    // The real shared theme script must toggle and restore the mode.
    await page.locator("[data-theme-toggle]").click();
    assert.equal(
      await page.locator("html").getAttribute("data-theme"),
      theme === "dark" ? "light" : "dark",
    );
    await page.locator("[data-theme-toggle]").click();
    assert.deepEqual(errors, [], `${screen}: JavaScript errors`);
    report.checks.push({
      screen,
      theme,
      width,
      height,
      geometry,
      jsErrors: errors,
    });
    return { page, context, errors };
  }
  try {
    for (const screen of ["tracker", "dashboard", "login"])
      for (const theme of ["dark", "light"])
        for (const width of [1440, 390, 320]) {
          const { page, context, errors } = await open(
            screen,
            theme,
            width,
            screen === "tracker" && width === 1440
              ? 4022
              : width === 1440
                ? 1118
                : 844,
          );
          if (screen === "tracker") {
            // Production hides the administrative action; its empty group must not add a row.
            await page
              .locator("#btn-seed-master")
              .evaluate((el) => el.classList.add("hidden"));
            assert.equal(
              await page.locator(".header-utilities").isVisible(),
              false,
            );
            await page
              .locator("#btn-seed-master")
              .evaluate((el) => el.classList.remove("hidden"));
            assert.equal(
              await page.locator("#btn-seed-master").isVisible(),
              true,
            );
            page.once("dialog", (d) => d.accept("Navigation test career"));
            await page.locator("#edit-save-title").click();
            assert.equal(
              await page.locator("#save-title").textContent(),
              "Navigation test career",
            );
            await page.reload();
            await page.waitForFunction(
              () =>
                document.querySelector("#save-title")?.textContent ===
                "Navigation test career",
            );
            const wrap = page.locator(".table-wrap").first();
            if (width < 768)
              assert.equal(
                await wrap.evaluate((el) => el.scrollWidth > el.clientWidth),
                true,
                "mobile table must scroll",
              );
            await page.locator("#rows [data-action=edit]").first().click();
            assert.equal(
              await page
                .locator("#edit-card")
                .evaluate((el) => el.classList.contains("editing")),
              true,
            );
            assert.equal(await page.locator("#btn-update").isVisible(), true);
            assert.equal(await page.locator("#btn-rescan").isVisible(), false); // Scan state is optional, preserved by application logic.
            await page.screenshot({
              path: `${output}/editing-${theme}-${width}.png`,
              fullPage: true,
            });
            await page.locator("#btn-cancel").click();
            assert.equal(await page.locator("#btn-update").isVisible(), false);
            assert.equal(await page.locator("#btn-rescan").isVisible(), false);
            await page.locator("#search").fill("Foden");
            assert.equal(await page.locator("#rows tr").count(), 1);
            await page.locator("#search").fill("");
            await page.locator("#toggle-ex").check();
            assert.equal(await page.locator("#toggle-ex").isChecked(), true);
            const options = await page
              .locator("#formation-select option")
              .evaluateAll((els) => els.map((e) => e.value));
            for (const formation of options) {
              await page.locator("#formation-select").selectOption(formation);
              await page.waitForFunction(
                (n) => document.querySelectorAll(".pitch-pos").length === n,
                FORMATIONS[formation].layout.length,
              );
            }
            await page.locator("#formation-select").selectOption("4-3-3");
            await page.locator("#f-first").fill("Test");
            await page.locator("#f-surname").fill("Player");
            await page.locator("#f-pos").selectOption("CM");
            await page.locator("#f-intl").fill("80");
            await page.locator("#f-potmin").fill("85");
            await page.locator("#f-potmax").fill("90");
            const count = await page.locator("#rows tr").count();
            await page.locator("#btn-add").click();
            await page.waitForFunction(
              (n) => document.querySelectorAll("#rows tr").length === n,
              count + 1,
            );
            await page
              .locator('#rows [data-id="new-player"][data-action=edit]')
              .click();
            await page.locator("#f-first").fill("Updated");
            await page.locator("#btn-update").click();
            await page.locator("#btn-update").waitFor({ state: "hidden" });
            await page
              .locator('#rows [data-id="new-player"][data-action=edit]')
              .click();
            assert.equal(
              await page.locator("#f-first").inputValue(),
              "Updated",
            );
            await page.locator("#btn-cancel").click();
            page.once("dialog", (d) => d.accept());
            await page
              .locator('#rows [data-id="new-player"][data-action=delete]')
              .click();
            await page.waitForFunction(
              (n) => document.querySelectorAll("#rows tr").length === n,
              count,
            );
            // Render the dialog state without starting a camera or invoking OCR.
            await page
              .locator("#scan-modal")
              .evaluate((e) => e.classList.remove("hidden"));
            const dialog = await page.locator(".modal-panel").boundingBox();
            assert.ok(
              dialog.y >= 0 &&
                dialog.y + dialog.height <= page.viewportSize().height,
            );
            const capture = await page.locator(".modal-foot").boundingBox();
            assert.ok(capture.y + capture.height <= page.viewportSize().height);
            await page.screenshot({
              path: `${output}/scanner-${theme}-${width}.png`,
              fullPage: false,
            });
            await page
              .locator("#scan-modal")
              .evaluate((e) => e.classList.add("hidden"));
          }
          if (screen === "dashboard") {
            page.once("dialog", (d) => d.accept("Renamed save"));
            await page.locator("#save-rows [data-edit]").first().click();
            await page.waitForFunction(() =>
              document
                .querySelector("#save-rows")
                .textContent.includes("Renamed save"),
            );
            page.once("dialog", (d) => d.accept());
            await page.locator("#save-rows [data-del]").last().click();
            await page.waitForFunction(
              () => document.querySelectorAll("#save-rows tr").length === 2,
            );
            await page.locator("#save-rows [data-open]").first().click();
            await page.waitForURL("**/tracker.html?save=city");
            await page.waitForFunction(
              () =>
                document.querySelector("#save-title")?.textContent ===
                "Renamed save",
            );
            await page.goto(`${base}/index.html`);
            await page.waitForSelector("#save-rows tr");
            for (let n = 2; n > 0; n--) {
              page.once("dialog", (d) => d.accept());
              await page.locator("#save-rows [data-del]").last().click();
              await page.waitForFunction(
                (n) => document.querySelectorAll("#save-rows tr").length === n,
                n - 1,
              );
            }
            assert.equal(await page.locator("#empty-state").isVisible(), true);
            page.once("dialog", (d) => d.accept("New fixture save"));
            await page.locator("#btn-add-save").click();
            await page.waitForURL("**/tracker.html?save=new-save");
            await page.waitForFunction(
              () =>
                document.querySelector("#save-title")?.textContent ===
                "New fixture save",
            );
          }
          if (screen === "login") {
            await page.locator("#btn-signin").click();
            assert.match(await page.locator("#error").textContent(), /email/);
            await page.locator("#email").fill("fixture@example.test");
            await page.locator("#password").fill("password123");
            await page.locator("#btn-signup").click();
            await page.locator("#confirm-block").waitFor({ state: "visible" });
            await page.screenshot({
              path: `${output}/confirmation-${theme}-${width}.png`,
              fullPage: true,
            });
            await page.locator("#confirm-code").fill("123456");
            await page.locator("#btn-confirm").click();
            await page.locator("#confirm-block").waitFor({ state: "hidden" });
          }
          assert.deepEqual(errors, [], "No errors during interactions");
          assert.deepEqual(
            await page.evaluate(() =>
              Array.from(document.querySelectorAll("input,select"))
                .filter(
                  (e) =>
                    e.offsetWidth > 0 &&
                    e.getBoundingClientRect().right > innerWidth,
                )
                .map((e) => e.id),
            ),
            [],
          );
          if (screen !== "login") {
            // Exercise the shared link and the original confirmation/sign-out handlers.
            await page.locator("#back-to-dashboard").click();
            await page.waitForURL("**/index.html");
            await page
              .locator('#back-to-dashboard[aria-current="page"]')
              .waitFor();
            const target = `${base}/${screen === "dashboard" ? "index.html" : "tracker.html?save=city"}`;
            await page.goto(target);
            await page.locator(".app-nav").waitFor({ state: "visible" });
            page.once("dialog", (d) => {
              assert.equal(d.message(), "Sign out?");
              return d.dismiss();
            });
            await page.locator("#btn-signout").click();
            assert.equal(
              await page.evaluate(() =>
                sessionStorage.getItem("fixture-signout-count"),
              ),
              null,
            );
            assert.equal(page.url(), target);
            page.once("dialog", (d) => d.accept());
            await page.locator("#btn-signout").click();
            await page.waitForURL("**/login.html");
            assert.equal(
              await page.evaluate(() =>
                sessionStorage.getItem("fixture-signout-count"),
              ),
              "1",
            );
            assert.equal(await page.locator(".app-nav").count(), 0);
            await context.addInitScript(() => {
              // Avoid the pre-existing signed-out error alert blocking its own redirect.
              // Sign-out confirmation was exercised with real native dialogs above.
              window.alert = () => {};
              new MutationObserver(() => {
                if (document.querySelector(".app-nav:not([hidden])")) {
                  sessionStorage.setItem(
                    "fixture-unauthenticated-nav-shown",
                    "true",
                  );
                }
              }).observe(document, {
                subtree: true,
                attributes: true,
                childList: true,
              });
            });
            await page.goto(target, { waitUntil: "commit" });
            await page.waitForFunction(() =>
              location.pathname.endsWith("/login.html"),
            );
            await page.locator("#email").waitFor();
            assert.equal(
              await page.evaluate(() =>
                sessionStorage.getItem("fixture-unauthenticated-nav-shown"),
              ),
              null,
            );
            report.checks.push({
              screen,
              theme,
              width,
              navigation:
                "link, current page, sign-out cancel/confirm and signed-out redirect passed",
            });
          }
          await context.close();
        }
    // Intermediate breakpoints, focus, hover and reduced motion.
    for (const width of [768, 769, 900, 901, 1200]) {
      const { page, context } = await open("tracker", "dark", width, 1000);
      await page.keyboard.press("Tab");
      await page.locator("#btn-add").focus();
      assert.equal(
        await page
          .locator("#btn-add")
          .evaluate((e) => getComputedStyle(e).outlineStyle),
        "solid",
      );
      await page.locator("#btn-add").hover();
      assert.match(
        await page
          .locator("#btn-add")
          .evaluate((e) => getComputedStyle(e).backgroundImage),
        /linear-gradient/,
      );
      assert.equal(
        await page
          .locator("#btn-add")
          .evaluate((e) => getComputedStyle(e).transitionDuration),
        "0s",
      );
      await context.close();
    }
    for (const screen of ["dashboard", "tracker"]) {
      for (const width of [320, 1440]) {
        const { context } = await open(
          screen,
          width === 320 ? "light" : "dark",
          width,
          1000,
          true,
        );
        await context.close();
      }
    }
    const failureContext = await browser.newContext();
    await failureContext.addInitScript(() => {
      window.alert = () => {};
    });
    await failureContext.route("**/awsClient.js", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: fixture(false).replace(
          "export async function getSession() {",
          'export async function getSession() {throw new Error("Fixture session failure");',
        ),
      }),
    );
    const failurePage = await failureContext.newPage();
    await failurePage.goto(`${base}/index.html`);
    const failureStatus = failurePage.locator(
      '.app-loading-status[role="alert"]',
    );
    await failureStatus.waitFor();
    assert.match(await failureStatus.textContent(), /refresh to try again/);
    assert.equal(await failurePage.locator(".app-nav").isVisible(), false);
    assert.equal(await failurePage.locator(".app-header").isVisible(), false);
    report.checks.push({
      sessionFailure:
        "Loading state becomes an accessible error with a retry instruction",
    });
    await failureContext.close();
    report.status = "passed";
  } catch (error) {
    report.status = "failed";
    report.error = error.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
    await browser.close();
  }
  console.log(JSON.stringify(report, null, 2));
})();
