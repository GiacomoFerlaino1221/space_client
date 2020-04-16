<template>
  <div class="error-view">
    <canvas id="stars" ref="stars"></canvas>
    <h1>Please visit the bot to start the game</h1>
  </div>
</template>

<script>
const stars = () => {
  var canvas = document.getElementById("stars");
  var c = canvas.getContext("2d");

  var innerWidth = window.innerWidth - 20,
    innerHeight = window.innerHeight - 20,
    radius = 1,
    starsIndex = 0,
    stars = [],
    TWO_PI = Math.PI * 2,
    centerX = innerWidth / 2,
    centerY = innerHeight / 2,
    focalLength = 50,
    starRadius = null,
    starX = null,
    starY = null,
    numStars = 500,
    mouse = {},
    starX_dir = 0,
    starY_dir = 0,
    x,
    y,
    z;

  canvas.width = innerWidth;
  canvas.height = innerHeight;

  // Function for create new start
  function star(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;
    this.color = "#fff";
    starsIndex++;
    stars[starsIndex] = this;
    this.id = starsIndex;

    // Animate Stars
    this.update = function() {
      starX = (this.x - centerX) * (focalLength / this.z);
      starX += centerX;

      starY = (this.y - centerY) * (focalLength / this.z);
      starY += centerY;

      starRadius = radius * (focalLength / this.z);

      starX += starX_dir;
      starY += starY_dir;

      this.z += -4;

      if (this.z <= 0) {
        this.z = parseInt(innerWidth);
      }

      this.draw();
    };

    // Function for draw star
    this.draw = function() {
      c.beginPath();
      c.arc(starX, starY, starRadius, TWO_PI, false);
      c.fillStyle = this.color;
      c.shadowColor = "#fff";
      c.shadowBlur = 10;
      c.fill();
      c.closePath();
    };
  }

  // X,Y,Z values
  var s;
  for (s = 0; s < numStars; s++) {
    x = Math.random() * innerWidth;
    y = Math.random() * innerHeight;
    z = Math.random() * innerWidth;
    new star(x, y, z);
  }

  // Function for animate canvas objects
  function animate() {
    requestAnimationFrame(animate);
    c.fillStyle = "#371536";
    c.fillRect(0, 0, innerWidth, innerHeight);

    for (var i in stars) {
      stars[i].update();
    }
  }

  animate();
};

export default {
  mounted() {
    let a = document.getElementById("tm");
    a.click();

    // setTimeout(() => {
    //   stars();
    // });

    // window.addEventListener("resize", () => {
    //   stars();
    // });
  }
};
</script>

<style lang="scss" scoped>
.error-view {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  h1 {
    text-shadow: white 0 0 5px;
    position: fixed;
  }

  canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>