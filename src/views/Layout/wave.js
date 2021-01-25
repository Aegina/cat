class Mountain {
  constructor(color, y, p) {
    this.c = color;
    this.y = y;
    this.offset = p.random(100, 200);
    this.t = 0;
  }
  display(p) {
    let xoff = 0;
    p.noStroke();
    p.fill(this.c);
    p.noiseDetail(1.7, 1.3);
    p.beginShape();
    for (let x = 0; x <= p.width + 25; x += 25) {
      const yoff = p.map(
        p.noise(xoff + this.offset, this.t + this.offset),
        0,
        1,
        0,
        200
      );
      const y = this.y - yoff;
      p.vertex(x, y);
      xoff += 0.08;
    }
    p.vertex(p.width + 100, p.height);
    p.vertex(0, p.height);
    p.endShape(p.CLOSE);

    this.t += 0.005;
  }
}

class Particle {
  constructor(p) {
    this.x = p.random(0, p.width);
    this.y = p.random(0, p.height);
    this.r = p.random(1, 8);
    this.p = p;
  }
  // creation of a particle.
  createParticle(p) {
    p.noStroke();
    // p.fill('rgba(200,169,169,1)');
    p.fill('rgba(0,0,0,1)');
    p.circle(this.x, this.y, this.r);
  }

  // setting the particle in motion.
  moveParticle(p) {
    if (this.x < 0 || this.x > p.width) {
      this.xSpeed *= -1;
    }
    if (this.y < 0 || this.y > p.height) {
      this.ySpeed *= -1;
    }
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  // this function creates the connections(lines)
  // between particles which are less than a certain distance apart
  joinParticles(particles) {
    particles.forEach((element) => {
      let dis = this.p.dist(this.x, this.y, element.x, element.y);
      if (dis < 85) {
        this.p.stroke('rgba(255,255,255,0.04)');
        this.p.line(this.x, this.y, element.x, element.y);
      }
    });
  }
}
export { Mountain, Particle };
