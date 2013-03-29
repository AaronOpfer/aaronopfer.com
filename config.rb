# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "stylesheets"
sass_dir = "sass"
images_dir = "images"
javascripts_dir = "javascripts"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = :compressed
# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true

# Cache buster
asset_cache_buster do |path, real_path|
  if File.exists?(real_path)
	crc = Zlib::crc32(real_path.read).to_s(36)
	pathname = Pathname.new(path)
	new_path = "%s/%s.%s%s" % [pathname.dirname, pathname.basename(pathname.extname), crc, pathname.extname]

    {:path => new_path, :query => nil}
  end
end

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
