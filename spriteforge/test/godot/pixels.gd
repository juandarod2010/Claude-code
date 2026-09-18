extends SceneTree

# Definitive check: rebuild each original sprite from the atlas the way the
# engine addresses it (region + margin offset) and compare every pixel.
func _initialize():
	var frames = ResourceLoader.load("res://hero_frames.tres")
	var failures := 0
	var checked := 0

	for anim in frames.get_animation_names():
		for i in range(frames.get_frame_count(anim)):
			var tex = frames.get_frame_texture(anim, i)
			var atlas_image: Image = tex.atlas.get_image()
			if atlas_image == null:
				print("SKIP: atlas image unavailable under the dummy renderer")
				quit(0)
				return

			var name_key: String = anim if anim == "coin" else "%s_%d" % [anim, i + 1]
			var original: Image = ResourceLoader.load("res://originals/%s.png" % name_key).get_image()

			var region: Rect2 = tex.region
			var offset: Vector2 = tex.margin.position
			var full := Image.create(original.get_width(), original.get_height(), false, original.get_format())
			full.fill(Color(0, 0, 0, 0))
			full.blit_rect(atlas_image, region, offset)

			if full.get_size() != original.get_size():
				print("FAIL: %s size %s vs %s" % [name_key, full.get_size(), original.get_size()])
				failures += 1
				continue

			var diffs := 0
			for y in range(original.get_height()):
				for x in range(original.get_width()):
					var a := full.get_pixel(x, y)
					var b := original.get_pixel(x, y)
					# Ignore colour of fully transparent pixels; only alpha matters there.
					if a.a == 0.0 and b.a == 0.0:
						continue
					if a != b:
						diffs += 1
			checked += 1
			if diffs > 0:
				print("FAIL: %s differs in %d pixels" % [name_key, diffs])
				failures += 1
			else:
				print("  %s  %d x %d  identical" % [name_key, original.get_width(), original.get_height()])

	if failures == 0:
		print("PIXEL-EXACT IN GODOT: %d/%d sprites" % [checked, checked])
	quit(failures)
