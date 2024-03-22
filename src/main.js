import kaboom from "kaboom"
import { createClient } from "@supabase/supabase-js";

async function main() {
  const kb = kaboom({
    // width: 640,
    // height: 480,
    font: "sans-serif",
    background: [141, 183, 255],
    // background: [ 0, 0, 0, 0 ],
    maxFPS: 30,
    global: false,
  });

  kb.volume(0.5);

  kb.loadSound("oof", "sounds/oof.mp3");

  kb.loadSprite("dodo", "sprites/Dodo_10x.png", {
    sliceX: 4,
    sliceY: 3,
    anims: {
      idle: {
        from: 0,
        to: 3,
        speed: 5,
        loop: true,
      },
      walk: {
        from: 4,
        to: 7,
        speed: 10,
        loop: true,
      },
      jump: {
        from: 10,
        to: 11,
        speed: 10,
        loop: false,
      },
    },
  });

  kb.loadSprite("ground", "tiles/Tileset_Cropped_10x.png", {
    sliceX: 2,
    sliceY: 1,
    anims: {
      move: {
        from: 0,
        to: 1,
        loop: true,
      },
    },
  });

  kb.loadSprite("hunter", "sprites/Hunter_10x.png", {
    sliceX: 4,
    sliceY: 1,
    anims: {
      walk: {
        from: 0,
        to: 3,
        loop: true,
        speed: 7,
      },
    },
  });

  const FLOOR_HEIGHT = 48;
  // const SPEED = 320;
  const JUMP_FORCE = 700;

  kb.scene("game", () => {
    let score = 0;
    let time = 0;

    kb.setGravity(800);

    const player = kb.add([
      kb.sprite("dodo"),
      kb.pos(kb.width() / 8, kb.height() / 2),
      kb.rotate(0),
      kb.anchor("center"),
      kb.area({ scale: kb.vec2(0.65, 1), offset: kb.vec2(10, 0) }),
      kb.body(),
      kb.doubleJump(1),
    ]);

    player.flipX = true;

    player.play("walk");

    kb.add([
      kb.sprite("ground", {
        tiled: true,
        width: kb.width(),
        height: FLOOR_HEIGHT,
        frame: 0,
        anim: "move",
      }),
      kb.area(),
      kb.outline(1),
      kb.pos(0, kb.height() - FLOOR_HEIGHT * 3),
      // kb.anchor("botleft"),
      kb.body({ isStatic: true }),
    ]);

    const spawnEnemy = () => {
      const enemyHunter = kb.add([
        kb.sprite("hunter"),
        kb.pos(kb.width(), kb.height() - FLOOR_HEIGHT * 3 - 16),
        kb.rotate(0),
        kb.area({ scale: kb.vec2(0.7, 1), offset: kb.vec2(25, 0) }),
        kb.anchor("botleft"),
        kb.body(),
        kb.offscreen({ destroy: true }),
        kb.move(kb.LEFT, 240 + Math.floor(time) * 2),
        "hunter",
      ]);

      enemyHunter.flipX = false;

      enemyHunter.play("walk");

      kb.wait(kb.rand(1, 5), spawnEnemy);
    };

    spawnEnemy();

    player.onCollide("hunter", (e, col) => {
      if (!col?.isBottom()) {
        if (col?.isLeft()) {
        } else {
          kb.burp();
          kb.go("gameover");
        }
      } else {
        player.jump(JUMP_FORCE * 0.75);
        player.play("jump");
        kb.shake(4);
        kb.destroy(e);
        kb.play("oof");

        score += 100;
      }
    });

    player.onGround(() => {
      player.play("walk");
    });

    kb.onKeyPress("space", () => {
      if (player.isGrounded()) {
        player.jump(JUMP_FORCE);
        player.play("jump");
      } else {
        player.doubleJump(JUMP_FORCE * 0.8);
        player.play("jump");
      }
    });

    const scoreLabel = kb.add([
      kb.text(`Score: ${score}`, {
        font: "monospace",
        size: 24,
        align: "right",
      }),
      kb.pos(24, 24),
    ]);

    // kb.debug.inspect = true;

    // increment score every frame
    kb.onUpdate(() => {
      score++;
      time += kb.dt();
      scoreLabel.text = `Score: ${Math.floor(score)} / Time: ${Math.floor(
        time
      )}`;
    });
  });

  kb.scene("gameover", () => {
    kb.add([
      kb.text("Game Over", {
        font: "monospace",
      }),
      kb.pos(kb.width() / 2, kb.height() / 2),
      kb.anchor("center"),
    ]);

    kb.add([
      kb.text("Press space to restart", {
        font: "monospace",
      }),
      kb.pos(kb.width() / 2, kb.height() / 2 + 32),
      kb.anchor("center"),
    ]);

    kb.onKeyPress("space", () => {
      kb.go("game");
    });
  });

  kb.go("game");
}

main();
