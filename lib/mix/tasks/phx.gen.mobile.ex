defmodule Mix.Tasks.Phx.Gen.Mobile do
  use Mix.Task

  @start_apps [
    :porcelain
  ]

  @shortdoc "Import Sticky Mobile's Template"

  @moduledoc """

  """

  @doc false
  def run(args) do
    # Application.put_env(:phoenix, :serve_endpoints, true, persistent: true)
    # Mix.Tasks.Run.run(run_args() ++ args)

    run_args()
  end

  def mobile_frontend(app_dir, project) do
    material_kit_assets = "#{app_dir}/priv/static/mobile"
    File.cp_r(material_kit_assets, File.cwd!() <> "/priv/static/mobile")

    # frontend controller 
    Mix.Generator.create_file(
      File.cwd!() <> "/lib//#{project.alias_name}_web/controllers/mobile_page_controller.ex",
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.mobile/mobile_page_controller.ex",
        project: project
      )
    )

    # frontend view
    material_loginview_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/views" <> "/mobile_page_view.ex"

    Mix.Generator.create_file(
      material_loginview_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.mobile/mobile_page_view.ex",
        project: project
      )
    )

    # frontend layout

    material_frontend_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/layout" <> "/mobile.html.eex"

    Mix.Generator.create_file(
      material_frontend_ex,
      EEx.eval_file("#{app_dir}/priv/templates/layout/mobile.html.eex",
        project: project
      )
    )

    # login template
    material_login_html_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/mobile_page" <> "/index.html.eex"

    Mix.Generator.create_file(
      material_login_html_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.mobile/mobile_index.html.eex",
        project: project
      )
    )
  end

  def mobile_login(app_dir, project) do
    # login controller 
    Mix.Generator.create_file(
      File.cwd!() <> "/lib//#{project.alias_name}_web/controllers/mobile_login_controller.ex",
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.mobile/mobile_login_controller.ex",
        project: project
      )
    )

    # login view
    material_loginview_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/views" <> "/mobile_login_view.ex"

    Mix.Generator.create_file(
      material_loginview_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.mobile/mobile_login_view.ex",
        project: project
      )
    )

    # login template
    material_login_html_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/mobile_login" <> "/login.html.eex"

    Mix.Generator.create_file(
      material_login_html_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.mobile/login.html.eex", project: project)
    )
  end

  defp run_args() do
    Enum.each(@start_apps, &Application.ensure_all_started/1)
    IO.puts("importing Material Dashboard")

    server = Application.get_env(:red_potion, :server)
    project = Application.get_env(:red_potion, :project)
    app_dir = Application.app_dir(:phoenix)

    mobile_frontend(app_dir, project)
    # material_dashboard(app_dir, project)
    mobile_login(app_dir, project)

    ~s(\r\n\r\nPlease put the following routes to your router.ex\r\n\r\n\tscope \"/mobile\", #{
      project.name
    }Web do\r\n\t  pipe_through \:browser\r\n\t  get\(\"/login\", MobileLoginController, :index\)\r\n\t  post\(\"/authenticate\", MobileLoginController, :authenticate\)\r\n\t  get\(\"/logout\", MobileLoginController, :logout\)\r\n\tend\r\n)
    |> IO.puts()

    ~s(\r\n\tscope \"/mobile\", #{project.name}Web do\r\n\t  pipe_through \:browser\r\n\t  get\(\"/\", MobilePageController, :index\)\r\n\tend\r\n\r\n)
    |> IO.puts()

    []
  end
end
