const apiEndpoint = "https://valorant-api.com/v1/seasons?language=ja-JP";

let seasonsSelect = document.querySelector(".seasons-select");

fetch(apiEndpoint)
  .then((response) => response.json())
  .then((object) => {
    let allSeasons = object.data;
    let promises = [];

    allSeasons.forEach((season) => {
      if (season.parentUuid != null) {
        promises.push(
          fetch(`https://valorant-api.com/v1/seasons/${season.parentUuid}?language=ja-JP`)
            .then((response) => response.json())
            .then((object) => {
              season.displayName = `${object.data.displayName} ${season.displayName}`;
            })
        );
      }
    });

    // 全ての非同期操作が完了するのを待機
    Promise.all(promises)
      .then(() => {
        allSeasons.forEach((season) => {
          let option = document.createElement("option");
          option.innerText = season.displayName;
          option.value = season.uuid;
          // 今シーズンにcheckedする
          let today = new Date();
          today.setDate(today.getDate() - 1);
          if (new Date(season.startTime) < today && today < new Date(season.endTime) && season.parentUuid != null) {
            option.selected = true;

            // シーズンがいつからいつまでかを設定する
            setSeasonTime(season);

            // そのシーズンの全日数を設定する
            let seasonDays = document.querySelector(".season-days-num");

            let seasonDaysNum =
              (new Date(season.endTime).setHours(0, 0, 0, 0) - new Date(season.startTime).setHours(0, 0, 0, 0)) /
              1000 /
              60 /
              60 /
              24;

            seasonDays.innerText = `${seasonDaysNum}`;

            // if (Math.sign(seasonDaysNum) == 0 || Math.sign(seasonDaysNum) == 1) {
            //   seasonDays.innerText = `${seasonDaysNum}`;
            // } else if (Math.sign(seasonDaysNum) == -1) {
            //   seasonDays.innerText = "0";
            // }
            // seasonsSelect.appendChild(option);
          }

          seasonsSelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  });

// セレクトボックス選択時処理
seasonsSelect.addEventListener("change", (event) => {
  fetch(`https://valorant-api.com/v1/seasons/${event.target.value}?language=ja-JP`)
    .then((response) => response.json())
    .then((object) => {
      setSeasonTime(object.data);
      setSeasonDays(object.data);
    });
});

// カウントダウンタイマー
let countdown = null;

const setSeasonTime = (season) => {
  // ISO8601形式を日本時間に変換
  const startTime = new Date(season.startTime);
  const endTime = new Date(season.endTime);

  // 年を取得
  const startTimeYear = startTime.getFullYear();
  const endTimeYear = endTime.getFullYear();

  // 月を取得
  const startTimeMonth = startTime.getMonth() + 1;
  const endTimeMonth = endTime.getMonth() + 1;

  // 日を取得
  const startTimeDate = startTime.getDate();
  const endTimeDate = endTime.getDate();

  // 曜日を数字で取得
  const startTimeDayNum = startTime.getDay();
  const endTimeDayNum = endTime.getDay();

  const dayOfTheWeek = { 0: "日", 1: "月", 2: "火", 3: "水", 4: "木", 5: "金", 6: "土" };

  // 曜日を取得
  const startTimeDay = dayOfTheWeek[startTimeDayNum];
  const endTimeDay = dayOfTheWeek[endTimeDayNum];

  // HTMLに挿入
  // let seasonStartTime = document.querySelector(".season-start-time");
  // seasonStartTime.innerText = `${startTimeYear}年${startTimeMonth}月${startTimeDate}日${startTimeDay}曜日から`;
  let seasonStartTimeYear = document.querySelector(".start-time-year");
  let seasonStartTimeMonth = document.querySelector(".start-time-month");
  let seasonStartTimeDate = document.querySelector(".start-time-date");
  let seasonStartTimeDay = document.querySelector(".start-time-day");
  seasonStartTimeYear.innerText = `${startTimeYear}/`;
  seasonStartTimeMonth.innerText = `${startTimeMonth}/`;
  seasonStartTimeDate.innerText = `${startTimeDate}`;
  seasonStartTimeDay.innerText = `(${startTimeDay})から`;

  // let seasonEndTime = document.querySelector(".season-end-time");
  // seasonEndTime.innerText = `${endTimeYear}年${endTimeMonth}月${endTimeDate}日${endTimeDay}曜日まで`;
  let seasonEndTimeYear = document.querySelector(".end-time-year");
  let seasonEndTimeMonth = document.querySelector(".end-time-month");
  let seasonEndTimeDate = document.querySelector(".end-time-date");
  let seasonEndTimeDay = document.querySelector(".end-time-day");
  seasonEndTimeYear.innerText = `${endTimeYear}/`;
  seasonEndTimeMonth.innerText = `${endTimeMonth}/`;
  seasonEndTimeDate.innerText = `${endTimeDate}`;
  seasonEndTimeDay.innerText = `(${endTimeDay})まで`;

  let dayRemaining = document.querySelector(".day-remaining-num");

  const dayRemainingNum =
    (new Date(season.endTime).setHours(0, 0, 0, 0) - new Date(new Date().setHours(0, 0, 0, 0))) / 1000 / 60 / 60 / 24;

  if (Math.sign(dayRemainingNum) == 0 || Math.sign(dayRemainingNum) == 1) {
    dayRemaining.innerText = `${dayRemainingNum}`;
  } else if (Math.sign(dayRemainingNum) == -1) {
    dayRemaining.innerText = "0";
  }

  if (countdown) {
    clearInterval(countdown);
  }

  console.log(countdown);

  countdown = setInterval(function () {
    // すでにインターバルがあれば止める

    console.log("countdown");
    const now = new Date(); //今の日時
    // const target = new Date(now.getFullYear(), now.getMonth() + 1, 0, "23", "59", "59"); //ターゲット日時を取得
    const target = endTime;
    const remainTime = target - now; //差分を取る（ミリ秒で返ってくる

    //指定の日時を過ぎていたら処理をしない
    if (remainTime < 0) {
      document.querySelector(".countdown-day").innerText = 0;
      document.querySelector(".countdown-hour").innerText = 0;
      document.querySelector(".countdown-min").innerText = 0;
      document.querySelector(".countdown-sec").innerText = 0;
      clearInterval(countdown);
      return false;
    }

    //差分の日・時・分・秒を取得
    const difDay = Math.floor(remainTime / 1000 / 60 / 60 / 24);
    const difHour = Math.floor(remainTime / 1000 / 60 / 60) % 24;
    const difMin = Math.floor(remainTime / 1000 / 60) % 60;
    const difSec = Math.floor(remainTime / 1000) % 60;

    //残りの日時を上書き
    document.querySelector(".countdown-day").innerText = difDay;
    document.querySelector(".countdown-hour").innerText = difHour;
    document.querySelector(".countdown-min").innerText = difMin;
    document.querySelector(".countdown-sec").innerText = difSec;

    //指定の日時になればカウントを止める
    if (remainTime < 0) clearInterval(countdown);
  }, 1000); //1秒間に1度処理
};

const setSeasonDays = (season) => {
  // そのシーズンの全日数を設定する
  let seasonDaysNum =
    (new Date(season.endTime).setHours(0, 0, 0, 0) - new Date(season.startTime).setHours(0, 0, 0, 0)) /
    1000 /
    60 /
    60 /
    24;

  let seasonDays = document.querySelector(".season-days-num");
  seasonDays.innerText = `${seasonDaysNum}`;
};
