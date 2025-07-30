package main

import (
	"html/template"
	"net/http"
)

// Handler untuk halaman login admin
func adminLoginHandler(w http.ResponseWriter, _ *http.Request) {
	tmpl := template.Must(template.New("login").Parse(`
	<!DOCTYPE html>
	<html><head><title>Admin Login</title></head><body>
	<h2>Login Admin Panel</h2>
	<form method="POST" action="/admin/login">
	  <input type="text" name="username" placeholder="Username" required><br><br>
	  <input type="password" name="password" placeholder="Password" required><br><br>
	  <button type="submit">Login</button>
	</form>
	</body></html>
	`))
	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

// Handler untuk dashboard admin
func adminDashboardHandler(w http.ResponseWriter, _ *http.Request) {
	tmpl := template.Must(template.New("dashboard").Parse(`
	<!DOCTYPE html>
	<html><head><title>Admin Dashboard</title></head><body>
	<h2>Dashboard Admin (Go)</h2>
	<p>Selamat datang di admin panel sederhana berbasis Go.</p>
	<a href="/admin/users">Kelola Users</a><br><br>
	<a href="/admin/logout">Logout</a>
	</body></html>
	`))
	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

// Handler untuk halaman admin users
func adminUsersHandler(w http.ResponseWriter, _ *http.Request) {
	tmpl := template.Must(template.New("users").Parse(`
	<!DOCTYPE html>
	<html>
	<head>
		<title>Admin Users</title>
		<style>
			body { font-family: Arial, sans-serif; margin: 20px; }
			table { border-collapse: collapse; width: 100%; }
			th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
			th { background-color: #f2f2f2; }
			.btn { padding: 5px 10px; margin: 2px; text-decoration: none; border-radius: 3px; }
			.btn-primary { background-color: #007bff; color: white; }
			.btn-danger { background-color: #dc3545; color: white; }
		</style>
	</head>
	<body>
		<h2>Kelola Users</h2>
		<p><a href="/admin">← Kembali ke Dashboard</a></p>
		
		<div id="users-container">
			<p>Loading users...</p>
		</div>

		<script>
			// Fetch users from API
			fetch('/api/users')
				.then(response => response.json())
				.then(data => {
					const container = document.getElementById('users-container');
					if (data.success && data.data && data.data.length > 0) {
						let html = '<table><thead><tr><th>ID</th><th>Email</th><th>Full Name</th><th>Role</th><th>Active</th><th>Created At</th><th>Actions</th></tr></thead><tbody>';
						data.data.forEach(user => {
							html += '<tr>';
							html += '<td>' + user.id + '</td>';
							html += '<td>' + user.email + '</td>';
							html += '<td>' + user.full_name + '</td>';
							html += '<td>' + user.role + '</td>';
							html += '<td>' + (user.is_active ? 'Yes' : 'No') + '</td>';
							html += '<td>' + new Date(user.created_at).toLocaleDateString() + '</td>';
							html += '<td>';
							html += '<a href="#" class="btn btn-primary" onclick="toggleUser(' + user.id + ')">Toggle Status</a> ';
							html += '<a href="#" class="btn btn-danger" onclick="deleteUser(' + user.id + ')">Delete</a>';
							html += '</td>';
							html += '</tr>';
						});
						html += '</tbody></table>';
						container.innerHTML = html;
					} else {
						container.innerHTML = '<p>No users found or error loading users.</p>';
					}
				})
				.catch(error => {
					console.error('Error:', error);
					document.getElementById('users-container').innerHTML = '<p>Error loading users: ' + error.message + '</p>';
				});

			function toggleUser(userId) {
				if (confirm('Are you sure you want to toggle this user status?')) {
					fetch('/api/users/' + userId + '/toggle-status', {
						method: 'PATCH'
					})
					.then(response => response.json())
					.then(data => {
						if (data.success) {
							location.reload();
						} else {
							alert('Error: ' + data.message);
						}
					})
					.catch(error => {
						alert('Error: ' + error.message);
					});
				}
			}

			function deleteUser(userId) {
				if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
					fetch('/api/users/' + userId, {
						method: 'DELETE'
					})
					.then(response => response.json())
					.then(data => {
						if (data.success) {
							location.reload();
						} else {
							alert('Error: ' + data.message);
						}
					})
					.catch(error => {
						alert('Error: ' + error.message);
					});
				}
			}
		</script>
	</body>
	</html>
	`))
	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}
