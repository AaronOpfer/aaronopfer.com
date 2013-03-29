require 'erb'
require 'zlib'
require 'rubygems'
require 'config_build'
require 'fileutils'
require 'open3'
if USE_ONLINE_CLOSURE == true
	require 'net/http'
	require 'json'
else
	require 'closure-compiler'
end 

scripts = ["javascripts/swipe.js","javascripts/ao.js"]
ie_scripts = ["ie_javascripts/html5shiv.js","ie_javascripts/eventShim.js","ie_javascripts/respond.js"]

$pages = ["home","career","music"]


def cachebust_uri(path)
	crc = Zlib::crc32(File.read(path)).to_s(36)
	matches = path.match(/(.+)(\.[^\/]+)/)
	"\"" + matches[1] + "." + crc + matches[2] + "\""
end


def load_scripts_development(scripts,advanced)
	output = ""
	for script in scripts
		filename = "js/"+script.match(/[a-zA-Z0-9\.]+$/)[0]
		FileUtils.cp(script,filename)
		output += "<script src="+cachebust_uri(filename)+"></script>"
	end
	output
end

def load_scripts_production(scripts,advanced)
	output = ""
	for script in scripts
		output += File.read(script)
	end
	filename = "js/" + Zlib::crc32(output).to_s(36) + ".js"
	
	optimizations = 'SIMPLE_OPTIMIZATIONS'
	if advanced == true
		optimizations = 'ADVANCED_OPTIMIZATIONS'
	end
	
	# if the file already exists, skip compiling
	if File.exists?(filename) === false

		if USE_ONLINE_CLOSURE == true
			puts "Using online closure compiler."
			uri = URI.parse("http://closure-compiler.appspot.com/compile")
			response = Net::HTTP.post_form(uri,
				"output_format" => "json",
				"output_info" => "compiled_code",
				"compilation_level" => optimizations,
				"warning_level" => "verbose",
				"output_file_name" => "default.js",
				"js_code" => output
			)
			if response.code != "200"
				raise "POST returned #{response.code}"
			end
			json =  JSON.parse(response.body)
			output = json['compiledCode']
		else
			puts "Using offline closure compiler."
			closure = Closure::Compiler.new(:compilation_level => optimizations)
			output = closure.compile(output)
		end
		
		File.open(filename, "w+") do |f|
			f.write(output)
		end
	else
		puts "Skipping closure compilation."
	end
	"<script src="+cachebust_uri(filename)+"></script>\n"
end

def load_scripts(scripts,advanced)
	if PRODUCTION	== true
		load_scripts_production(scripts,advanced)
	else
		load_scripts_development(scripts,advanced)
	end
end



script_includes = load_scripts(scripts,true)
ie_script_includes = load_scripts(ie_scripts,false)
template = File.read("index.html.erb")

$currentPage = nil

def selected(pageName)
	
	if pageName === $currentPage
		'class="selected"'
	end
end


for page in $pages
	$currentPage = page
	
	
	renderer = ERB.new(template)
	html = renderer.result()
	
	if PRODUCTION === true
		Open3.popen3("java -jar htmlcompressor-1.5.3.jar --remove-surrounding-spaces max --remove-quotes") {|stdin, stdout, stderr|
			stdin.write(html)
			stdin.close
			
			html = stdout.read()
		}
	end
	
	if page == "home"
		page = "index"
	end

	File.open(page+".html", "w+") do |f| 
		f.write(html)
	end
end




