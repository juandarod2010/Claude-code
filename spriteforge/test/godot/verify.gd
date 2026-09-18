extends SceneTree

func _initialize():
	var expected := {
		"walk_1": Vector2i(48, 48), "walk_2": Vector2i(48, 48),
		"walk_3": Vector2i(48, 48), "walk_4": Vector2i(48, 48),
		"coin": Vector2i(32, 32),
	}
	var failures := 0

	var frames = ResourceLoader.load("res://hero_frames.tres")
	if frames == null:
		print("FAIL: hero_frames.tres did not load at all")
		quit(1)
		return
	if not (frames is SpriteFrames):
		print("FAIL: loaded resource is %s, not SpriteFrames" % frames.get_class())
		quit(1)
		return

	var anims = frames.get_animation_names()
	print("animations: ", anims)
	if not anims.has("walk") or not anims.has("coin"):
		print("FAIL: expected animations 'walk' and 'coin'")
		failures += 1
	if frames.get_frame_count("walk") != 4:
		print("FAIL: walk has %d frames, expected 4" % frames.get_frame_count("walk"))
		failures += 1
	if not frames.get_animation_loop("walk"):
		print("FAIL: walk should loop")
		failures += 1
	if frames.get_animation_speed("walk") != 10.0:
		print("FAIL: walk speed is %f, expected 10.0" % frames.get_animation_speed("walk"))
		failures += 1

	# The real check: every frame must report its ORIGINAL untrimmed size.
	# This is what the margin arithmetic exists for.
	for anim in anims:
		for i in range(frames.get_frame_count(anim)):
			var tex = frames.get_frame_texture(anim, i)
			if not (tex is AtlasTexture):
				print("FAIL: %s frame %d is %s, not AtlasTexture" % [anim, i, tex.get_class()])
				failures += 1
				continue
			var size = Vector2i(tex.get_width(), tex.get_height())
			print("  %s[%d]  size=%s  region=%s  margin=%s" % [anim, i, size, tex.region, tex.margin])
			# Frames are ordered, so walk[0] is walk_1, etc.
			var key: String = anim if anim == "coin" else "%s_%d" % [anim, i + 1]
			if expected.has(key) and size != expected[key]:
				print("FAIL: %s reports %s, original was %s" % [key, size, expected[key]])
				failures += 1
			if tex.atlas == null:
				print("FAIL: %s frame %d has no atlas texture" % [anim, i])
				failures += 1

	if failures == 0:
		print("ALL GODOT CHECKS PASSED")
	else:
		print("%d GODOT CHECK(S) FAILED" % failures)
	quit(failures)
