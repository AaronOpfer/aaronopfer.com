require 'erb'
require 'zlib'
require 'rubygems'
require 'closure-compiler'
require 'config'
require 'fileutils'
require 'open3'


def load_scripts_development(scripts)
	output = ""
	for script in scripts
		crc = Zlib::crc32(File.read("javascripts/"+script)).to_s(36)
		filename = "js/"+crc+"."+script
		FileUtils.cp("javascripts/"+script,filename)
		output += "<script src=\""+filename+"\" defer></script>"
	end
	output
end

def load_scripts_production(scripts)
	output = ""
	for script in scripts
		output += File.read("javascripts/"+script)
	end
	filename = "js/" + Zlib::crc32(output).to_s(36) + ".js"
	
	# if the file already exists, skip compiling
	if File.exists?(filename) === false
		puts "Using closure compiler."
		closure = Closure::Compiler.new(:compilation_level => 'ADVANCED_OPTIMIZATIONS')
		output = closure.compile(output)
		
		
		File.open(filename, "w+") do |f|
			f.write(output)
		end
	else
		puts "Skipping closure compilation."
	end
	"<script src=\""+filename+"\" defer></script>\n"
end

def load_scripts(scripts)
	if PRODUCTION	== true
		load_scripts_production(scripts)
	else
		load_scripts_development(scripts)
	end
end

renderer = ERB.new(File.read("index.html.erb"))
html = renderer.result()

if PRODUCTION === true
	Open3.popen3("java -jar htmlcompressor-1.5.3.jar") {|stdin, stdout, stderr|
		stdin.write(html)
		stdin.close
		
		html = stdout.read()
	}
end

File.open("index.html", "w+") do |f| 
	f.write(html)
end