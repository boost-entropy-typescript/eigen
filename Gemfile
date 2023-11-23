source 'https://rubygems.org'

gem 'fastlane'

gem 'cocoapods', '>= 1.11.3'
gem 'activesupport', '>= 6.1.7.3', '< 7.1.0'

# So we know if we need to run `pod install`
gem 'cocoapods-check'
gem 'cocoapods-patch'
gem 'down'
gem 'dotenv'
gem 'json'

group :development do
  gem 'lowdown' # For handling notifications + certs
end

group :test do
  gem 'xcode-install' # To ensure we have the right SDK installed for running tests
  gem 'xcpretty' # Makes CI readable
end

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
