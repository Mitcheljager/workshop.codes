desc "Create blind index for users"
task create_blind_index_users: :environment do
  User.unscoped.where(email_bidx: nil).find_each do |user|
    user.compute_email_bidx
    user.save(validate: false)
  end
end
