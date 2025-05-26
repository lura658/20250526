let video;
let facemesh;
let predictions = [];

let handpose;
let handPredictions = [];

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 加入 handpose
  handpose = ml5.handpose(video, handModelReady);
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function modelReady() {
  // 臉部模型載入完成
}

function handModelReady() {
  // 手部模型載入完成
}

function draw() {
  image(video, 0, 0, width, height);

  // 臉部關鍵點
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    const [x, y] = keypoints[94];
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 50, 50);
  }

  // 手部關鍵點
  if (handPredictions.length > 0) {
    const hand = handPredictions[0];
    for (let i = 0; i < hand.landmarks.length; i++) {
      const [x, y, z] = hand.landmarks[i];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 10, 10);
    }

    // 剪刀石頭布判斷
    const gesture = detectGesture(hand.landmarks);
    fill(0);
    textSize(32);
    text(gesture, 20, 50);
  }
}

// 簡單判斷剪刀石頭布
function detectGesture(landmarks) {
  // 取得每根手指的指尖座標
  const tips = [8, 12, 16, 20]; // 食指、中指、無名指、小指
  let extended = 0;
  for (let i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]][1] < landmarks[tips[i] - 2][1]) {
      extended++;
    }
  }
  // 大拇指
  let thumbExtended = landmarks[4][0] > landmarks[3][0];

  // 判斷
  if (extended === 0 && !thumbExtended) return "石頭";
  if (extended === 2 && !thumbExtended) return "剪刀";
  if (extended === 4) return "布";
  return "";
}
