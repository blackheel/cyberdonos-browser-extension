class CyberdonosBackgroundJS {
  constructor() {
    this.HOSTNAME = this.getServer()
    this.IsCyberdonosServerSideEnabled = true
    this.TAGS = null
    this.updateListIntervalFn = null
    this.SERVER_UNREACHABLE = "server-unreachable"
    console.log(`Выбран сервер: ${this.HOSTNAME}`)
    this.HEADERS = {
      headers: {
        "token": null
      }
    }
    this.STATUSES = [
      {id: 0, name: "новый", file: "not-verified" },
      {id: 1, name: "проверено", file: "verified-by-admin"},
      {id: 2, name: "проверено внешним аудитом", file: "3rdparty" }
    ]
    this.ROLES = {
      "1": "суперадмин",
      "2": "админ",
      "3": "Пользователь",
      "4": "reserved"
    }
    this.LISTS = {
      twitter: {
        L_BUTTERS_STOTCH: [],
        POROHOBOTY_PIDORY: []
      },
      youtube: {},
      vk: {}
    }

    this.CACHE = {
      "youtube": {},
      "vk": {},
      "twitter": {}
    }

   this.KARATEL_GET_BY_USERNAME_URL = `https://karatel.foss.org.ua/lib64/libcheck.so?screen_name=`
   this.CONFIG = {
     updateInterval: 5000,
     updateListsIntervalInSeconds: 0,
     lists: {
       lists: {
         youtube: {
           YTOBSERVER_MAINDB: {
             active: true,
             icon_url: browser.extension.getURL("assets/ytkremlebot.png"),
             text: "В списках Кремлеботов YTObserver/Metabot for youtube",
             type: "text",
             urls: [
               `https://raw.githubusercontent.com/YTObserver/YT-ACC-DB/master/mainDB`,
               browser.extension.getURL("assets/YTObserver-mainDB.txt")
             ]
           },
           YTOBSERVER_SMM: {
             active: true,
             icon_url: browser.extension.getURL("assets/ytsmm.png"),
             text: "С списках SMM ботов YTObserver/Metabot for youtube",
             type: "text",
             urls: [
               `https://raw.githubusercontent.com/YTObserver/YT-ACC-DB/master/additional_list_smm`,
               browser.extension.getURL("assets/YTObserver_smm_all.txt")
             ]
           },
           YTOBSERVER_POLITICAL_BOTS: {
             active: true,
             icon_url: browser.extension.getURL("assets/political.png"),
             text: "С списках политических ботов YTObserver/Metabot for youtube",
             type: "text",
             urls: [
               `https://raw.githubusercontent.com/YTObserver/YT-ACC-DB/master/additional_list_political`,
               browser.extension.getURL("assets/YTObserver_political_bots.txt")
             ]
           }
         },
         twitter: {
           ANTIBOT4NAVALNY: {
             active: true,
             icon_url: browser.extension.getURL("assets/antibot4navalny.png"),
             text: "В списках кремлеботов antibot4navalny - https://twitter.com/antibot4navalny",
             type: "text",
             urls: [
               `https://blocktogether.org/show-blocks/HYZ_Qq1P1xyxcDDbgLQ3l8OhhFLAolDZvpUqHP3A`,
               browser.extension.getURL("assets/antibot4navalny.txt")
             ]
           },
           L_BUTTERS_STOTCH: {
             active: false,
             icon_url: browser.extension.getURL("assets/butters.png"),
             text: "В списке ботов/мракобесов Л.Баттерса Стотча - https://twitter.com/L_Stotch/status/1020894577341935616",
             type: "text",
             urls: [ browser.extension.getURL("assets/butters.txt") ]
           },
           NASHACANADA: {
             active: true,
             icon_url: browser.extension.getURL("assets/nasha_canada_bots.png"),
             text: "В списках ботов, ваты и долбаебов @NashaCanada - https://twitter.com/NashaCanada/status/1079629384976261120",
             type: "text",
             urls: [ browser.extension.getURL("assets/nashacanada.txt") ]
           },
           KARATEL: {
             active: true,
             icon_url: browser.extension.getURL("assets/karatel.png"),
             text: "В списках Карателя",
             url: `https://karatel.foss.org.ua/lib64/libcheck.so?screen_name=`
           },
           POROHOBOTY_PIDORY: {
             active: true,
             icon_url: browser.extension.getURL("assets/ukrobot.png"),
             text: "В списках #ПОРОХОБОТЫПИДОРЫ",
             type: "text",
             urls: [
               `https://gitlab.com/mmxa/pb/-/raw/master/pb.csv`,
               browser.extension.getURL("assets/porohobotypidori.txt")
             ]
           }
       },
       vk: {},
      },
      api: {
        youtube: {},
        twitter: {
          KARATEL: {
            active: true,
            icon_url: browser.extension.getURL("assets/karatel.png"),
            text: "В списках Карателя",
            url: `https://karatel.foss.org.ua/lib64/libcheck.so?screen_name=`
          }
        },
        vk: {}
      }
    }
  }

  }

  getServer() {
    const serverNames = [
      "https://node1.cyberdonos.xyz",
      "https://node2.cyberdonos.xyz",
      "https://node3.cyberdonos.xyz",
      "https://node4.cyberdonos.xyz",
      "https://node5.cyberdonos.xyz"
    ]
    //const serverNames = [ "http://localhost" ]
    return serverNames[Math.floor(Math.random() * (serverNames.length) - 0)]
  }

  loadTwitterLists() {
    const listPromises = []
    Object.keys(this.CONFIG.lists.lists.twitter).filter(e => e !== 'KARATEL').forEach(key => {
      console.log(key);
      this.CONFIG.lists.lists.twitter[key].urls.forEach(url => listPromises.push(fetch(url)))
    })
    return Promise.all(listPromises).then(rawData => {
      return Promise.all([
        rawData[0].status === 200 ? rawData[0].text() : rawData[1].text(),
        rawData[2].text(),
        rawData[3].text(),
        rawData[4].status === 200 ? rawData[4].text() : rawData[5].text()
      ])
    })
    .then(results => {
      // обработка юзернеймов антибот4навальный
      if (results[0].trim().startsWith("<")) {
        const parser = new DOMParser()
        const blocktogetherPage = parser.parseFromString(results[0], 'text/html')
        const userNames = []
        const aNames = blocktogetherPage.querySelectorAll('tr.blocked-user > td > a.screen-name')
        if (aNames.length > 0) {
          aNames.forEach(item => {
            userNames.push(item.text.trim())
          })
          this.LISTS.twitter.ANTIBOT4NAVALNY = userNames
        }
      }
      else {
        this.LISTS.twitter.ANTIBOT4NAVALNY = results[0].split("\n") || []
      }
      // список Баттерса
      this.LISTS.twitter.L_BUTTERS_STOTCH = results[1].split("\n") || []
      // список нашейканады
      this.LISTS.twitter.NASHACANADA = results[2].split("\n") || []
      // список ПОРОХОБОТЫПИДОРЫ
      this.LISTS.twitter.POROHOBOTY_PIDORY = results[3].split("\n").map(e => e.includes(";") ? e.split(";")[1].trim() : null) || []
      console.log(this.LISTS.twitter);
    })
  }

  loadYoutubeLists() {
    const listPromises = []
    Object.keys(this.CONFIG.lists.lists.youtube).forEach(key => {
      this.CONFIG.lists.lists.youtube[key].urls.forEach(url => listPromises.push(fetch(url)))
    })
    return Promise.all(listPromises)
           .then(ytresultsRaw => {
             const mainDBRaw = ytresultsRaw[0].status === 200 ? ytresultsRaw[0] : ytresultsRaw[1]
             const SMMALLRaw = ytresultsRaw[2].status === 200 ? ytresultsRaw[2] : ytresultsRaw[3]
             const SMMPoliticalRaw = ytresultsRaw[4].status === 200 ? ytresultsRaw[4] : ytresultsRaw[5]
             return Promise.all([mainDBRaw.text(), SMMALLRaw.text(), SMMPoliticalRaw.text() ])
           })
           .then(ytObserverData => {
             const _ytobserverArrayMain = ytObserverData[0].split("\r\n").map(e => e.split("="))
             const _ytobserverArraySmm = ytObserverData[1].split("\r\n").map(e => e.split("="))
             const _ytobserverArrayPolitical = ytObserverData[2].split("\r\n").filter(e => !e.startsWith("//")).map(e => e.split("="))
             this.LISTS.youtube.YTOBSERVER_MAINDB = []
             this.LISTS.youtube.YTOBSERVER_SMM = []
             this.LISTS.youtube.YTOBSERVER_POLITICAL_BOTS = []
             _ytobserverArrayMain.forEach(e => this.LISTS.youtube.YTOBSERVER_MAINDB.push(e[0]))
             _ytobserverArraySmm.forEach(e => this.LISTS.youtube.YTOBSERVER_SMM.push(e[0]))
             _ytobserverArrayPolitical.forEach(e => this.LISTS.youtube.YTOBSERVER_POLITICAL_BOTS.push(e[0]))
           })
           .catch(e => console.error(e))
  }

  registerInsider() {
    return fetch(`${this.HOSTNAME}/api/v1/insiders/register`, { method: "POST" })
           .then((response) => response.json())
           .then((result) => {
             console.log(`ответ о регистрации ${JSON.stringify(result)}`)
             if (result.data.token && result.data.role) {
               localStorage.setItem("token", result.data.token)
               localStorage.setItem("role", result.data.role)
               this.HEADERS.headers.token = result.data
             }
             else {
               console.error(`Токен не получен`)
             }
           })
           .catch(e => {
             browser.notifications.create("failed-to-start", {
               "type": "basic",
               "title": `Кибердонос: ${e.message} ошибка при старте.`,
               "message": `${e}`
             })
           })
  }

  createDefaultOrLoadConfig() {
    if (!localStorage.getItem("config")) {
      localStorage["config"] = JSON.stringify(this.CONFIG)
    }
    else {
      this.CONFIG = JSON.parse(localStorage["config"])
    }
  }

  getCreatedDateAndLastModified(vkId) {
    //console.log(`Получение данных о регистрации и логине для ${vkId}`)
    return new Promise((resolve, reject) => {
      return fetch(`https://vk.com/foaf.php?id=${vkId}`)
      .then((response) => response.text())
      .then((str) => {
        // это группа - игнорируем ее
        if (vkId.startsWith("-")) {
          resolve({ registerDate: null, lastLoggedIn: null })
        }
        else {
          try {
            const xml = new window.DOMParser().parseFromString(str, "text/xml")
            const registerDate = xml.getElementsByTagName("ya:created").length > 0 ? dayjs(xml.getElementsByTagName("ya:created")[0].getAttribute("dc:date")).format("DD.MM.YY") : "null"
            const lastLoginDate = xml.getElementsByTagName("ya:lastLoggedIn").length > 0 ? dayjs(xml.getElementsByTagName("ya:lastLoggedIn")[0].getAttribute("dc:date")).format("DD.MM.YY") : "null"
            resolve({ registerDate: registerDate, lastLoggedIn: lastLoginDate })
          } catch (e) {
            console.error(e)
            resolve({ registerDate: e, lastLoggedIn: e })
          }
        }
      })
    })
  }

  getTags() {
    return fetch(`${this.HOSTNAME}/api/v1/tags`, this.HEADERS)
           .then((response) => response.json())
           .then((data) => this.TAGS = data.data)
           .catch(e => console.error(`Ошибка при получении тегов. ${e}`))
  }

  getPersonByVkId(vkId, force = false) {
    if (this.CACHE["vk"][vkId] && !force) {
      return new Promise((resolve, reject) => resolve(this.CACHE["vk"][vkId]))
    }
    else {
      return fetch(`${this.HOSTNAME}/api/v1/persons/get/vk/${vkId}`, this.HEADERS)
             .then((response) => response.json())
             .then((data) => {
               this.CACHE["vk"][vkId] = data
               return new Promise((resolve, reject) => resolve(data))
             })
             .catch(e => console.error(e))
    }

  }

  processKaratelResponse(response) {
    const lowerCasedResult = response.toLowerCase()
    let result = false
    try {
      const banPattern = /\"banned\": (false|true)/
      console.log(lowerCasedResult);
      const r = lowerCasedResult.match(banPattern)
      result = r[1] === "true" ? true : false
    } catch (e) {
      console.error("Ошибка при получении ответа от API-карателя:", e)
    }
    return result
  }

  getByTwitterUserName(userName, force = false) {
    if (this.CACHE["twitter"][userName] && !force) {
      // console.log('из кэша')
      return new Promise((resolve, reject) => resolve(this.CACHE["twitter"][userName]))
    }
    else {
      let result = { }
      return Promise.all([
               fetch(`${this.HOSTNAME}/api/v1/persons/get/twitter/${userName}`, this.HEADERS),
               fetch(this.KARATEL_GET_BY_USERNAME_URL + userName).catch(e => console.error(`Ошибка при обращении к API Карателя: ${e.message}`))
             ])
             .then((rawResults) => {
               return Promise.all([
                 rawResults[0].json(),
                 rawResults[1] ? rawResults[1].text() : null
               ])
             })
             .then((results) => {
               result = results[0]
               if (results[1] && this.processKaratelResponse(results[1])) {
                 if (!result.data) {
                   result.data = { }
                   result.data.inLists = [ ]
                 }
                 else {
                   result.data.inLists = [ ]
                 }
                 result.data.inLists.push('KARATEL')
               }
               const lists = this.findTwitterIdInLists(userName)
               if (lists.length > 0) {
                 if (!result.data) {
                   result.data = { }
                   result.data.inLists = [ ]
                 }
                 else {
                   if (!result.data.inLists) {
                     result.data.inLists = [ ]
                   }
                 }
                 lists.forEach(listElement => result.data.inLists.push(listElement))
               }
               //console.log(result)
               this.CACHE["twitter"][userName] = result
               return result
             })
             .catch(e => console.error(e))
    }
  }

  findTwitterIdInLists(id) {
    const listNames = Object.keys(this.LISTS.twitter).filter(e => e !== 'KARATEL')
    const inLists = []
    for (let i = 0; i < listNames.length; i++) {
      if (this.CONFIG.lists.lists.twitter[listNames[i]].active) {
        if (this.LISTS.twitter[listNames[i]].indexOf(id) !== -1) {
          inLists.push(listNames[i])
        }
      }
    }
    return inLists
  }

  findYTIdsInLists(id){
    const listNames = Object.keys(this.LISTS.youtube)
    const inLists = []
    for (let i = 0; i < listNames.length; i++) {
      if (this.CONFIG.lists.lists.youtube[listNames[i]].active) {
        if (this.LISTS.youtube[listNames[i]].indexOf(id) !== -1) {
          inLists.push(listNames[i])
        }
      }
    }
    return inLists
  }

  getByYTUser(id, force = false) {
    if (this.CACHE["youtube"][id] && !force) {
      //console.log(`Получение из кэша ${id}, ${JSON.stringify(this.CACHE["youtube"][id])}`)
      return new Promise((resolve, reject) => resolve(this.CACHE["youtube"][id]))
    }
    else {
      //console.log(`Получение с удаленного сервера ${id}`)
      let result = { }
      return fetch(`${this.HOSTNAME}/api/v1/persons/get/youtube/${id}`, this.HEADERS)
             .then(response => response.json())
             .then(_result => {
               //console.log(_result)
               result = _result
               if (!result.data) {
                 result.data = { }
               }
               result.data.inLists = this.findYTIdsInLists(id)
               this.CACHE["youtube"][id] = result
               return result
             })
             .catch(e => console.error(e))
    }
  }


  start() {
    this.loadTwitterLists()//.then(() => console.log(this.LISTS))
    this.loadYoutubeLists()//.then(() => console.log(this.LISTS))
    // инициализация дефолтных настроек для списков
    this.createDefaultOrLoadConfig()
    fetch(`${this.HOSTNAME}/api/v1/status/get`)
    .then(() => {

      if (localStorage.getItem("token") && localStorage.getItem("role")) {
        console.log(`Токен ${localStorage.getItem("token")} и роль уже установлены ${localStorage.getItem("role")}`)
        this.HEADERS.headers.token = localStorage.getItem("token")
        this.getTags()
        .then(() => this.startListener())
      }
      else {
        console.log('Попытка регистрации...')
        this.registerInsider()
        .then(() => {
          console.log("Успешная регистрация!")
          console.log(`Данные в localStorage: token - ${localStorage.getItem("token")}, role ${localStorage.getItem("role")}`)
          this.HEADERS.headers.token = localStorage.getItem("token")
          this.getTags()
          .then(() => this.startListener())
        })
        .catch(e => console.error("Ошибка во время регистрации", e))
      }
    })
    .catch(e => {
      browser.notifications.create(this.SERVER_UNREACHABLE, {
        "type": "basic",
        "title": `Кибердонос: ${this.HOSTNAME} недоступен.`,
        "message": `Попробуйте использовать прокси, vpn или tor. \n ERROR: ${e}`
      })
    })
  }

  startUpdateListsInterval() {
    this.updateListIntervalFn = setInterval(() => {
      this.loadTwitterLists()
      this.loadYoutubeLists()
      console.log('Списки обновлены.');
    }, this.CONFIG.updateListsIntervalInSeconds)
  }

  updateListsInterval(seconds){
    clearInterval(this.updateListIntervalFn)
    this.CONFIG.updateListsIntervalInSeconds = seconds * 1000
    if (seconds == 0) {
      localStorage["config"] = JSON.stringify(this.CONFIG)
    }
    else {
      this.startUpdateListsInterval()
    }
  }

  startListener() {
    if (this.CONFIG.updateListsIntervalInSeconds && this.CONFIG.updateListsIntervalInSeconds > 0) {
      this.startUpdateListsInterval()
    }
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      //console.log(request)
      if (request.action === 'getSystemData') {
        sendResponse({ tags: this.TAGS, server: this.HOSTNAME, statuses: this.STATUSES, config: this.CONFIG })
      }
      else if (request.action === 'setUpdateListsInterval' && parseInt(request.data)) {

      }
      else if (request.action === "getAccountData") {
        sendResponse({
          role_id: localStorage.getItem("role") || null,
          role_name: this.ROLES[localStorage.getItem("role")],
          token: localStorage.getItem("token")
        })
      }
      else if (request.action === "getPersonByVkId" && request.data) {
        const r = {  }
        r[request.data] = { }
        return this.getPersonByVkId(request.data)
        .then((result) => {
          r[request.data] = { data: result.data, dates: null }
          //console.log(result.data)
          return new Promise((resolve, reject) => {
            return this.getCreatedDateAndLastModified(request.data)
            .then((dates) => {
              //console.log(dates)
              r[request.data].dates = dates
              resolve(r)
            })
            .catch(e => console.error(e))

          })
        })
        .catch(e => console.error(e))
      }
      else if (request.action === 'getYoutubeUser' && request.id) {
        return this.getByYTUser(request.id)
               .catch(e => console.error(e))
      }
      else if (request.action === 'searchOrgs' && request.org) {
        return fetch(`${this.HOSTNAME}/api/v1/orgs/search/${request.org}`, this.HEADERS)
               .then((response) => response.json())
               .catch(e => console.error(e))
      }
      else if (request.action === "addPerson" && request.data && request.type) {
        console.log("request data - ", request)
        let insertResult = null
        return fetch(`${this.HOSTNAME}/api/v1/persons/${request.type}/add`,
                    {
                      headers: {
                        token: localStorage.getItem("token")
                      },
                      method: 'POST',
                      body: JSON.stringify(request.data)
                    }
                  )
                  .then(response => response.json())
                  .then(data => {
                    insertResult = data
                    if (request.type === "twitter") {
                      return this.getByTwitterUserName(request.data.id, true)
                    }
                    else if (request.type === "youtube") {
                      return this.getByYTUser(request.data.id, true)
                    }
                    else if (request.type === "vk") {
                      return this.getPersonByVkId(request.data.id, true)
                    }
                  })
                  .then(() => insertResult)
                  .catch(e => console.error(`error when adding person: ${e}`))
      }
      else if (request.action === "editPerson") {

      }
      else if (request.action === 'setToken' && request.data) {
        console.log(`Запрос на установку токена ${request.data}`)
        return fetch(`${this.HOSTNAME}/api/v1/insiders/get_role_by_token/${request.data}`)
        .then(response => response.json())
        .then(data => {
          return new Promise((resolve, reject) => {
            console.log(`Получен ответ о запросе токена: ${JSON.stringify(data)}`)
            if (data.role) {
              this.HEADERS.headers.token = request.data
              localStorage.setItem("token", request.data)
              localStorage.setItem("role", data.role)
              resolve({ message: "Токен установлен! "})
            }
            else {
              resolve({ message: "Токен не установлен! "})
            }
          })
        })
        .catch(e => console.error(e))
      }
      else if (request.action === 'getAbuse' && request.data.vk_id) {
        console.log('getAbuse');
        return fetch(`${this.HOSTNAME}/api/v1/persons/get_abuse/${request.data.vk_id}`, this.HEADERS)
        .then(response => response.json())
        .then(data => {
          return new Promise((resolve, reject) => {
            console.log(data)
            resolve(data)
          })
        })
        .catch(e => console.error(e))
      }
      else if (request.action === "getByTwitterUserName" && request.id) {
        //console.log(request);
        return this.getByTwitterUserName(request.id)
      }
      else if (request.action === "sendAbuse" && request.data) {
        return fetch(`${this.HOSTNAME}/api/v1/persons/abuse`, {
                headers: {
                  token: localStorage.getItem("token")
                },
                method: "POST",
                body: JSON.stringify({ vk_id: request.data.vk_id, text: request.data.text })
              })
              .then((response) => response.json())
              .then((data) => {
                return new Promise((resolve, reject) => {
                  console.log(data)
                  resolve(data)
                })
              })
              .catch(e => console.error(e))
      }
      else if (request.action === 'saveConfig' && request.data) {
        this.CONFIG = request.data
        localStorage["config"] = JSON.stringify(this.CONFIG)
        this.updateListsInterval(parseInt(this.CONFIG.updateListsIntervalInSeconds) || 0)
      }
      else {
        console.log(`неверный action ${JSON.stringify(request)}`)
      }
    })
  }
}

const cdbjs = new CyberdonosBackgroundJS()
console.log('background.js запускается...')
cdbjs.start()
